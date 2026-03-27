all:
	g++ -std=c++17 -o scheduler main.cpp scheduler.cpp storage.cpp

clean:
	rm -f scheduler scheduler_data.txt
	rm -rf server/node_modules client/node_modules client/dist

setup: all
	cd server && npm install
	cd client && npm install

run-server: all
	node server/index.js

run-client:
	cd client && npm run dev

run: all
	@echo "Starting backend..."
	@node server/index.js &
	@echo "Starting frontend..."
	@cd client && npm run dev
