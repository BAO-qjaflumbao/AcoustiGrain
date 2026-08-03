import 'package:flutter/material.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "System Settings",
            style: TextStyle(
              fontSize: 30,
              fontWeight: FontWeight.bold,
            ),
          ),

          const SizedBox(height: 25),

          // ================= SYSTEM INFORMATION =================

          Card(
            elevation: 2,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    "System Information",
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  SizedBox(height: 15),

                  ListTile(
                    leading: Icon(Icons.info_outline),
                    title: Text("Application"),
                    subtitle: Text("AcoustiGrain Dashboard"),
                  ),

                  Divider(),

                  ListTile(
                    leading: Icon(Icons.verified),
                    title: Text("Version"),
                    subtitle: Text("Version 1.0"),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 20),

          // ================= CONNECTION =================

          Card(
            elevation: 2,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    "Connection Status",
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  SizedBox(height: 15),

                  ListTile(
                    leading: Icon(Icons.cloud),
                    title: Text("Firebase"),
                    subtitle: Text("Not Connected"),
                    trailing: Icon(
                      Icons.cancel,
                      color: Colors.red,
                    ),
                  ),

                  Divider(),

                  ListTile(
                    leading: Icon(Icons.router),
                    title: Text("LoRaWAN Gateway"),
                    subtitle: Text("Waiting for Connection"),
                    trailing: Icon(
                      Icons.schedule,
                      color: Colors.orange,
                    ),
                  ),

                  Divider(),

                  ListTile(
                    leading: Icon(Icons.sensors),
                    title: Text("Handheld Probe"),
                    subtitle: Text("Offline"),
                    trailing: Icon(
                      Icons.cancel,
                      color: Colors.red,
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 20),

          // ================= WAREHOUSE =================

          Card(
            elevation: 2,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    "Warehouse Settings",
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  SizedBox(height: 15),

                  ListTile(
                    leading: Icon(Icons.warehouse),
                    title: Text("Total Rice Stacks"),
                    subtitle: Text("25"),
                  ),

                  Divider(),

                  ListTile(
                    leading: Icon(Icons.qr_code_scanner),
                    title: Text("Scan Mode"),
                    subtitle: Text("Manual Scan"),
                  ),

                  Divider(),

                  ListTile(
                    leading: Icon(Icons.notifications_active),
                    title: Text("Alert Level"),
                    subtitle: Text("Critical Only"),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 20),

          // ================= ABOUT =================

          Card(
            elevation: 2,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    "About",
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  SizedBox(height: 15),

                  Text(
                    "AcoustiGrain is an IoT-based rice storage monitoring system "
                    "that detects rice weevil infestation using bio-acoustic signal "
                    "analysis. The dashboard displays scan results, warehouse status, "
                    "and reports for warehouse personnel.",
                    style: TextStyle(
                      fontSize: 16,
                      height: 1.5,
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 30),
        ],
      ),
    );
  }
}