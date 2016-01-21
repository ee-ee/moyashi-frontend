JS_TARGETS = js/mithril.js \
             js/chan.js

all: style.css app.js

style.css: scss/*
	sassc -t compressed --sourcemap scss/style.scss style.css

app.js: js/*
	cat $(JS_TARGETS) > app.js
