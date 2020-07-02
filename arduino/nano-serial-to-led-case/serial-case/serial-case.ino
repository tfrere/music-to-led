/***************************************************
   Audio 2 Led project

   Arduino Nano Led controller firmware v0.1

   COMMANDS
   -----------------------------------------------
   00
   Displays the frame currently in the buffer
   Replies: 00
 *                                                 *
   02
   Setup led strip length
   Replies: nothing
 *                                                 *
    01 b1 g1 r1 b2 g2 r2 ... bn gn rn
   Reads nn pixels into the frame buffer
   Replies: nothing
 *                                                 *
   FF
   Clears the display and terminates the animation
   Replies: nothing
 ***************************************************/

#include <Adafruit_NeoPixel.h> 

#define BLUETOOTH_MODE false

#if defined(ARDUINO_AVR_NANO)
  #define DATAPIN 4
#else
  #define DATAPIN D4
#endif

#define PIXELS 500

byte pixelBuffer[3];
byte countBuffer[3];
int count = 0;

Adafruit_NeoPixel leds = Adafruit_NeoPixel(PIXELS, DATAPIN);

void setup()
{
  // Clear LEDs
  leds.begin();
  leds.clear();
  leds.show();

  // Open serial port and tell the controller we're ready.
  Serial.begin(1000000);
  Serial.println("Setup ok");
  Serial.write(0x00);
}

int bytesToInt(unsigned int x_high, unsigned int x_low) {
  int combined;
  combined = x_high;
  combined = combined*256;
  combined |= x_low;
  return combined;
}

void loop()
{
  // Read a command
  while (Serial.available() == 0);
  byte command = Serial.read();

  switch (command)
  {
    // Show frame
    case 0x00:

      // Update LEDs
      leds.show();

      // Tell the controller we're ready
      // We don't want to be receiving serial data during leds.show() because data will be dropped
      Serial.write(0x00);
      break;

    // Load frame
    case 0x01:

      // Read number of pixels
      while (Serial.available() == 0);

      Serial.readBytes(countBuffer, 2);
      count = bytesToInt(countBuffer[0], countBuffer[1]);

      // Read and update pixels
      for (int i = 0; i < count; i++)
      {
        Serial.readBytes(pixelBuffer, 3);
        leds.setPixelColor(i, pixelBuffer[0], pixelBuffer[1], pixelBuffer[2]);
      }
      break;

    // Clear
    case 0xFF:
      leds.clear();
      leds.show();
      break;
  }
}
