TESTS = test/*.js
REPORTER = dot

test:
	@./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		$(TESTS)

run:
	@NODE_ENV=development \
	node server.js

.PHONY: test