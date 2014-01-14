package org.apache.cordova.awpagent;


import java.util.Date;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;

import com.axeda.protocol.awp.DataItem;
import com.axeda.protocol.awp.DataMessage;
import com.axeda.protocol.awp.DeviceID;
import com.axeda.protocol.awp.Header;
import com.axeda.protocol.awp.SetDataMessage;
import com.axeda.protocol.awp.StreamTransmissionTransport;
import com.axeda.protocol.awp.Transmission;
import com.axeda.protocol.awp.TransmissionTransport;
import com.axeda.protocol.common.ChannelProvider;
import com.axeda.protocol.common.ILogger;
import com.axeda.protocol.common.Logger;
import com.axeda.protocol.common.SocketChannelProvider;


/**
 * This class echoes a string called from JavaScript.
 */
public class AgentPI
   extends CordovaPlugin
{
   private ReceiveMultipleAWPMessage receiver   = new ReceiveMultipleAWPMessage();
   private AWPSend                   sender     = new AWPSend();
   private static boolean            running    = false;
   private BluetoothAdapter          bluetooth;
   Context                           tmpContext = null;
   private static String             serialNumber;


   @Override
   public boolean execute(String action, JSONArray args, CallbackContext callbackContext)
      throws JSONException
   {
      bluetooth = BluetoothAdapter.getDefaultAdapter();
      serialNumber = bluetooth.getAddress();

      if (action.equals("startScan")) {
         startScan();
      }
      else if (action.equals("stopScan")) {

      }
      return false;
   }


   public void startScan()
   {

      bluetooth.startDiscovery();

      BroadcastReceiver mReceiver = new BroadcastReceiver() {
         @Override
         public void onReceive(Context context, Intent intent)
         {
            tmpContext = context;
            String action = intent.getAction();
            if (BluetoothDevice.ACTION_FOUND.equals(action)) {
               BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
               //If Raspberry is in near location start receiving Messages
               if (device.getName() == "raspberrypi-0") {
                  AgentPI.running = true;
                  receiver.start();
               }
            }
         }
      };

      IntentFilter filter = new IntentFilter(BluetoothDevice.ACTION_FOUND);
      tmpContext.registerReceiver(mReceiver, filter);
   }

   class ReceiveMultipleAWPMessage
      extends Thread
   {

      /* Server information. */
      private static final String serverAddress = "doubleslash-sandbox.axeda.com:19000";
      private static final int    TIMEOUT       = 2;

      /* Device information. */
      private static final String modelNumber   = "Phones";
      private static final String owner         = "jschneider";


      /* Sender Object */

      public ReceiveMultipleAWPMessage()
      {
         super();
      }


      /**
       * Thread starts working by scanning for Dataitems to be able to be received
       */
      public void run()
      {
         DeviceID deviceID = new DeviceID(modelNumber, AgentPI.serialNumber, owner);

         /* Stream based transmission */
         TransmissionTransport transport = new StreamTransmissionTransport(
                                                                           getChannelProvider(),
                                                                           serverAddress,
                                                                           deviceID, TIMEOUT);

         /*
          * Now poll to receive all the pending data items from the Axeda Platform.
          */
         while (AgentPI.running) {
            Transmission recv = null;
            try {
               recv = transport.receive(TIMEOUT);
            }
            catch (Exception e) {
               //     log.error("receive failed", e, ReceiveMultipleAWPMessage.class.getName());
               e.printStackTrace();
            }

            if (recv != null) {
               com.axeda.protocol.awp.Message[] messages = recv.getMessages();

               for (int i = 0; i < messages.length; i++) {
                  if (messages[i] instanceof SetDataMessage) {
                     SetDataMessage msg = (SetDataMessage)messages[i];
                     DataItem[] dataItems = msg.getDataItems();
                     // Determine kind of DataItem
                     for (DataItem item : dataItems) {
                        String dataItemName = item.getDataItemName();
                        // log.info(dataItemName, dataItemName);
                        if (dataItemName.equals("dialogOpen")) {

                        }
                     }
                     break;
                  }
               }

               if (!recv.getHeader().isPoll())
                  break;
            }

         }
      }


      private ChannelProvider getChannelProvider()
      {
         return (new SocketChannelProvider());
      }

   }

   class AWPSend
   {

      private final ILogger        LOGGER            = Logger.getLogger();
      /* Server information. */
      private static final String  SERVERADDRESS     = "doubleslash-sandbox.axeda.com:19000";
      private static final int     TIMEOUT           = 30;

      private final Date           TIMESTAMP         = new Date();

      /* Device information. */
      private static final String  MODELNUMBER       = "RaspGate";                           // Enter a model, such as
      // "P100" or
      // "TankMonitor"
      private static final String  SERIALNUMBER      = "JSRTG01";
      private static final String  OWNER             = "jschneider";

      /* Header information. */
      private static final boolean ack               = false;
      private static final boolean poll              = false;

      /* DataItem information. */
      private static final long    dataitem_priority = 5;


      /**
       * 
       * @param dataitem
       */
      public void sendDataItem(DataItem dataitem)
      {
         try {
            Header header = new Header(MODELNUMBER, SERIALNUMBER, OWNER, ack, poll);
            Transmission transmission = new Transmission(header);

            DataMessage dataMessage = new DataMessage(TIMESTAMP, dataitem_priority);

            dataMessage.addDataItem(dataitem);
            transmission.addMessage(dataMessage);
            sendAndReceive(transmission);
         }
         catch (Exception e) {
            LOGGER.error("Failed", e, AWPSend.class.getName());
         }
      }


      public void sendOpenAccept()
      {
         try {
            Header header = new Header(MODELNUMBER, SERIALNUMBER, OWNER, ack, poll);
            Transmission transmission = new Transmission(header);

            DataMessage dataMessage = new DataMessage(TIMESTAMP, dataitem_priority);
            DataItem dataItem = new DataItem("Action", "");
            dataMessage.addDataItem(dataItem);
            transmission.addMessage(dataMessage);
            sendAndReceive(transmission);
         }
         catch (Exception e) {
            LOGGER.error("Failed", e, AWPSend.class.getName());
         }
      }


      private void sendAndReceive(Transmission trans)
      {
         TransmissionTransport transport = new StreamTransmissionTransport(
                                                                           getChannelProvider(),
                                                                           SERVERADDRESS);
         try {
            transport.send(trans, TIMEOUT);
         }
         catch (Exception e) {
            LOGGER.error("Failed", e, AWPSend.class.getName());
         }
      }


      /* Create Socket-based channel provider. */
      private ChannelProvider getChannelProvider()
      {
         return (new SocketChannelProvider());
      }
   }

}