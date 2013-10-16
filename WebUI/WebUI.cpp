#include "WebUI.h"
#include "mongoose.h"
#include <string>
#include <sstream>
#include <fstream>
#include <memory>
#include <iostream>

using namespace std;

namespace WebUI {

string slurp(string filename)
{

	ifstream infile(filename);
	if (infile.good())
		return static_cast<stringstream const&>(stringstream() << infile.rdbuf()).str();
	else
		return ""; //TODO: This is horrible.
}

string toJSON(vector<float> arr)
{
	ostringstream r;
	r << "[" << arr[0];
	for(auto a = ++arr.begin(); a < arr.end(); a++)
	{
		r << "," << *a;
	}
	r << "]";
	return r.str();
}


int WebUIServer::incomingRequest(mg_event* event)
{
	string file = slurp("static" + string(event->request_info->uri));
	
	if (file.empty())
	{
		string notFound("Page not found");
		mg_printf(event->conn,
			"HTTP/1.1 404 Not Found\r\n"
			"Content-Type: text/html\r\n"
			"Content-Length: %d\r\n"        // Always set Content-Length
			"\r\n"
			"%s",
			notFound.length(), notFound.c_str());
	}
	else
	{
		// Send HTTP reply to the client
		mg_printf(event->conn,
			"HTTP/1.1 200 OK\r\n"
			"Content-Type: text/html\r\n"
			"Content-Length: %d\r\n"        // Always set Content-Length
			"\r\n"
			"%s",
			file.length(), file.c_str());
	}
	// Returning non-zero tells mongoose that our function has replied to
	// the client, and mongoose should not send client any more data.
	return 1;
}

int WebUIServer::incomingWebSocket(mg_event* event)
{
	char *data;
	int bits, len;

	// Handshake, and send initial server message
	mg_websocket_handshake(event->conn);

	cout << "Websocket connected"<<endl;

	webSockets.insert(event->conn);
	// Read messages sent by client. Echo them back.
	while ((len = mg_websocket_read(event->conn, &bits, &data)) > 0) {
		printf("got message: [%.*s]\n", len, data);
		mg_websocket_write(event->conn, WEBSOCKET_OPCODE_TEXT, data, len);

		free(data);
	}
	webSockets.erase(event->conn);
	cout << "Websocket disconnected"<<endl;

	return 1;
}

int WebUIServer::eventHandler(mg_event* event)
{
	WebUIServer* server = (WebUIServer*)event->user_data;
	const char *versionHeader = NULL;
	switch(event->type)
	{
	case MG_REQUEST_BEGIN:
		versionHeader = mg_get_header(event->conn, "Sec-WebSocket-Version");
		if (versionHeader != NULL)
			if (strcmp(versionHeader, "13") != 0) {
				mg_printf(event->conn, "%s", "HTTP/1.1 426 Upgrade Required\r\n\r\n");
				return 1;
			} else {
				return server->incomingWebSocket(event);
			}
		else
			return server->incomingRequest(event);
		break;
	default:
		// We do not handle any other event
		return 0;
	}
}

void WebUIServer::start()
{
	const char *options[] = {
		 "listening_ports", port.c_str(),
		 "request_timeout_ms", "0",
	     NULL
	   };

	ctx = mg_start(options, &WebUIServer::eventHandler, this);
}

void WebUIServer::stop()
{
	mg_stop(ctx);
}

void WebUIServer::send(string message)
{
	for(mg_connection* c : webSockets)
	{
		mg_websocket_write(c, WEBSOCKET_OPCODE_TEXT, message.c_str(), message.length());
	}
}


void WebUIServer::linePlot(std::string seriesName, vector<float> ys, std::string color)
{
	ostringstream json;
	json << "{\"series\": \"" << seriesName << "\","
	 << "\"ys\": " << toJSON(ys) << ","
	 << "\"color\": \"" << color << "\","
	 << "\"minX\": " << 0 << ","
	 << "\"maxX\": " << 10 << ","
	 << "\"minY\": " << 0 << ","
	 << "\"maxY\": " << 1000
	 << "}";

	send(json.str().c_str());
}


}