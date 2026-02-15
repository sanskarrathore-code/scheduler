all:
	g++ -std=c++17 -o scheduler main.cpp scheduler.cpp storage.cpp

clean:
	rm -f scheduler scheduler_data.txt
