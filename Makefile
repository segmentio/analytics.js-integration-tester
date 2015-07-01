#
# Binaries.
#

DUO = node_modules/.bin/duo
DUOT = node_modules/.bin/duo-test

#
# Files.
#

SRCS = index.js
TESTS = test/index.test.js

#
# Program arguments.
#

DUOT_ARGS = --commands "make build.js"

#
# Chore targets.
#

# Install node dependencies.
node_modules: package.json $(wildcard node_modules/*/package.json)
	@npm install
	@touch node_modules

# Remove local/built files.
clean:
	rm -fr build.js
.PHONY: clean

# Remove local/built files and vendor files.
distclean: clean
	rm -rf components node_modules
.PHONY: distclean

#
# Build targets.
#

# Build a test bundle.
build.js: node_modules component.json $(SRCS) $(TESTS)
	@$(DUO) --development --stdout $(TESTS) > build.js
.DEFAULT_GOAL = build.js

#
# Test targets.
#

# Test locally in PhantomJS.
test-phantomjs: node_modules build.js
	@$(DUOT) -R spec $(DUOT_ARGS) phantomjs
.PHONY: test-phantomjs

# Test locally in a browser.
test-browser: node_modules build.js
	@$(DUOT) $(DUOT_ARGS) browser
.PHONY: test-browser

# Test shortcut.
test: test-phantomjs
