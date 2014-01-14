package org.apache.cordova.bluetooth;


import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

import android.bluetooth.BluetoothAdapter;


/**
 * This class echoes a string called from JavaScript.
 */
public class BluetoothUtil
   extends CordovaPlugin
{
   private BluetoothAdapter bluetooth;
   String                   address = "blubb";


   @Override
   public boolean execute(String action, JSONArray args, CallbackContext callbackContext)
      throws JSONException
   {
      if (action.equals("getBtAdress")) {
         bluetooth = BluetoothAdapter.getDefaultAdapter();
         if (bluetooth != null) {
            address = bluetooth.getAddress();
         }
         else {
            System.out.println("Bluetoothadapter == null");
            return false;
         }
         String formattedAddress = formatAddress(address);

         this.returnAddress(formattedAddress, callbackContext);
         return true;
      }
      return false;
   }


   private String formatAddress(String address)
   {
      String tmp = null;
      if (address != null && address.length() > 0) {
         tmp = address.replace(":", "");
         return tmp;
      }
      else {
         return tmp;
      }
   }


   private void returnAddress(String message, CallbackContext callbackContext)
   {
      if (message != null && message.length() > 0) {
         callbackContext.success(message);
      }
      else {
         callbackContext.error("Expected one non-empty string argument.");
      }
   }

}