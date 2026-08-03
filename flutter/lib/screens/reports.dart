import 'package:flutter/material.dart';

import '../widgets/summary_card.dart';

class ReportsScreen extends StatelessWidget {
  const ReportsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Reports & Analytics",
            style: TextStyle(
              fontSize: 30,
              fontWeight: FontWeight.bold,
            ),
          ),

          const SizedBox(height: 25),

          Row(
            children: const [
              Expanded(
                child: SummaryCard(
                  title: "Total Scans",
                  value: "25",
                  icon: Icons.search,
                  color: Colors.blue,
                ),
              ),

              SizedBox(width: 20),

              Expanded(
                child: SummaryCard(
                  title: "Safe",
                  value: "20",
                  icon: Icons.check_circle,
                  color: Colors.green,
                ),
              ),

              SizedBox(width: 20),

              Expanded(
                child: SummaryCard(
                  title: "Moderate",
                  value: "3",
                  icon: Icons.warning,
                  color: Colors.orange,
                ),
              ),

              SizedBox(width: 20),

              Expanded(
                child: SummaryCard(
                  title: "Critical",
                  value: "2",
                  icon: Icons.dangerous,
                  color: Colors.red,
                ),
              ),
            ],
          ),

          const SizedBox(height: 35),

          Card(
            elevation: 2,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    "Quick Statistics",
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  SizedBox(height: 20),

                  ListTile(
                    leading: CircleAvatar(
                      backgroundColor: Color(0xFFE3F2FD),
                      child: Icon(
                        Icons.analytics,
                        color: Colors.blue,
                      ),
                    ),
                    title: Text("Highest Confidence"),
                    subtitle: Text("98% (Stack A1)"),
                  ),

                  Divider(),

                  ListTile(
                    leading: CircleAvatar(
                      backgroundColor: Color(0xFFFFF3E0),
                      child: Icon(
                        Icons.warning_amber_rounded,
                        color: Colors.orange,
                      ),
                    ),
                    title: Text("Critical Stacks"),
                    subtitle: Text("2 (C3, D4)"),
                  ),

                  Divider(),

                  ListTile(
                    leading: CircleAvatar(
                      backgroundColor: Color(0xFFE8F5E9),
                      child: Icon(
                        Icons.calendar_today,
                        color: Colors.green,
                      ),
                    ),
                    title: Text("Today's Scans"),
                    subtitle: Text("25 completed scans"),
                  ),

                  Divider(),

                  ListTile(
                    leading: CircleAvatar(
                      backgroundColor: Color(0xFFFFEBEE),
                      child: Icon(
                        Icons.update,
                        color: Colors.red,
                      ),
                    ),
                    title: Text("Last Scan"),
                    subtitle: Text("Today, 10:30 AM"),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}