## global

all: android bb

clean: android_clean bb_clean

propagate: android_propagate bb_propagate

## Sass

sass: sass_compile

sass_compile:
	#sass --update www/css/sass:www/css/

sass_watch:
	#sass --watch www/css/sass:www/css/

## Android

android: android_install

android_clean:
	rm -rf ./platforms/android/assets/www

android_propagate: android_clean sass
	cp -r www ./platforms/android/assets/www
	mv ./platforms/android/assets/www/cordova-1.7.0.js ./platforms/android/assets/www/phonegap-1.4.1.js
	mv ./platforms/android/assets/www/lib/js/GoogleAnalyticsPlugin.android.js ./platforms/android/assets/www/lib/js/GoogleAnalyticsPlugin.js
	mv ./platforms/android/assets/www/childbrowser.android.js ./platforms/android/assets/www/childbrowser.js

android_build: android_propagate
	rm -rf ./platforms/android/bin
	ant -f ./platforms/android/build.xml debug
	
android_release: android_propagate
	rm -rf ./platforms/android/bin
	ant -f ./platforms/android/build.xml release

android_install: android_build
	adb install -r ./platforms/android/bin/CapitalTour-debug.apk
	
android_local_install:
	rm -rf ./platforms/android/bin
	ant -f ./platforms/android/build.xml debug
	adb install -r ./platforms/android/bin/CapitalTour-debug.apk

## BlackBerry

bb: bb_install

bb_clean:
	rm -rf ./platforms/blackberry/www

bb_propagate: bb_clean sass
	cp -r www ./platforms/blackberry/www
	cp -r platforms/blackberry/ext ./platforms/blackberry/www/ext
	cp -r platforms/blackberry/ext-air ./platforms/blackberry/www/ext-air
	cp -r platforms/blackberry/resources ./platforms/blackberry/www/resources
	cp -r platforms/blackberry/config.xml ./platforms/blackberry/www/config.xml
	cp -r platforms/blackberry/plugins.xml ./platforms/blackberry/www/plugins.xml
	mv ./platforms/blackberry/www/phonegap-1.4.1.blackberry.js ./platforms/blackberry/www/phonegap-1.4.1.js
	mv ./platforms/blackberry/www/childbrowser.blackberry.js ./platforms/blackberry/www/childbrowser.js
	mv ./platforms/blackberry/www/data-remoteassets.js ./platforms/blackberry/www/data.js
	rm -rf ./platforms/blackberry/www/files

bb_install: bb_propagate
	ant -f ./platforms/blackberry/build.xml blackberry load-device 
	
bb_release: bb_propagate
	ant -f ./platforms/blackberry/build.xml blackberry build 