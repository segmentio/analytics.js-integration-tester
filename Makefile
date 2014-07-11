
#
# Target args.
#

PID = test/server/pid.txt
DUO = node_modules/.bin/duo
URL = http://localhost:4203

#
# Targets.
#

build/build.js: node_modules component.json index.js test/index.js
	@$(DUO) --development test/index.js build/build.js

node_modules: package.json
	@npm install

#
# Commands.
#

clean:
	@rm -fr build components node_modules

test: server build/build.js
	@open $(URL)

server: kill
	@node test/server &> /dev/null &
	@sleep 1

kill:
	@-test -e $(PID) \
		&& kill `cat $(PID)` \
		&& rm -f $(PID) \
		||:

.PHONY: clean
.PHONY: test
