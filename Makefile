
DUO = node_modules/.bin/duo

#
# Targets.
#

build/build.js: node_modules $(shell find lib) test/index.js
	@$(DUO) --development test/index.js build/build.js

node_modules: package.json
	@npm install

#
# Commands.
#

clean:
	@rm -fr build components node_modules

test: build/build.js
	@open test/index.html

.PHONY: clean
.PHONY: test
