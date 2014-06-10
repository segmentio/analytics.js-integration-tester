
SRC= $(wildcard lib/*.js test/index.js)

build: $(SRC)
	@duo --development test/index.js build/build.js

clean:
	@rm -fr build components

test: build
	@open test/index.html

.PHONY: clean test
