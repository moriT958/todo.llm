.PHONY: start backend frontend install install-backend install-frontend test test-backend test-frontend clean

start: backend frontend

backend:
	cd backend && npm start &

frontend:
	cd frontend && npm start &

install: install-backend install-frontend

install-backend:
	cd backend && npm install

install-frontend:
	cd frontend && npm install

test: test-backend test-frontend

test-backend:
	cd backend && npm test

test-frontend:
	cd frontend && npm test -- --watchAll=false

clean:
	pkill -f "node server.js" || true
	pkill -f "react-scripts start" || true

stop: clean