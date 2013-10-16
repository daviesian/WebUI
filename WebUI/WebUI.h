#include <string>
#include "mongoose.h"
#include <set>
#include <vector>

namespace WebUI
{

class WebUIServer
{

private:

	mg_context * ctx;
	std::string port;

	int incomingRequest(mg_event* event);
	int incomingWebSocket(mg_event* event);

	static int eventHandler(mg_event* event);

	std::set<mg_connection*> webSockets;



public:

	WebUIServer() : port("80") { }
	WebUIServer(int port) : port(std::to_string(port)) { }

	void start();
	void stop();

	void send(std::string message);

	void linePlot(std::string seriesName, std::vector<float> ys, std::string color);
};

}