#include "WebUI.h"
#include <windows.h>
#include <sstream>
#include <iostream>
#include <vector>

using namespace std;
using namespace WebUI;


int main(int argc, char* argv[])
{
	WebUIServer server;

	server.start();
	getchar();

	static const float arr[] = {0,1,4,9,16,25,36,49,64,81};
	vector<float> a(arr, arr + sizeof(arr) / sizeof(arr[0]));

	while(true)
	{
		for (float& e: a)
			e *= 1.01;

		server.linePlot("series 1", a, "#00f0ffff");
		Sleep(20);
		getchar();
	}
	getchar();
	server.stop();

	return 0;
}

