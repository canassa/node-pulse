TESTS = test/*.js
REPORTER = dot

test:
	@NODE_ENV=development \
	./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		$(TESTS)

run:
	@NODE_ENV=development \
	nodemon server.js

.PHONY: test