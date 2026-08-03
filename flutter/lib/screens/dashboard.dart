import 'package:flutter/material.dart';

import '../widgets/summary_card.dart';
import '../widgets/status_badge.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Warehouse Overview",
            style: TextStyle(
              fontSize: 30,
              fontWeight: FontWeight.bold,
            ),
          ),

          const SizedBox(height: 25),

          // Summary Cards
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
                  icon: Icons.warning_amber_rounded,
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

          const Text(
            "Recent Scan Activity",
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),

          const SizedBox(height: 15),

          Card(
            elevation: 2,
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: DataTable(
                  headingRowColor:
                      WidgetStatePropertyAll(Colors.grey.shade200),
                  columns: const [
                    DataColumn(label: Text("Stack ID")),
                    DataColumn(label: Text("Status")),
                    DataColumn(label: Text("Confidence")),
                    DataColumn(label: Text("Last Scan")),
                    DataColumn(label: Text("Recommendation")),
                  ],
                  rows: const [
                    DataRow(
                      cells: [
                        DataCell(Text("A1")),
                        DataCell(
                          StatusBadge(status: "Safe"),
                        ),
                        DataCell(Text("98%")),
                        DataCell(Text("July 27, 10:00 AM")),
                        DataCell(Text("No Action Needed")),
                      ],
                    ),
                    DataRow(
                      cells: [
                        DataCell(Text("B2")),
                        DataCell(
                          StatusBadge(status: "Moderate"),
                        ),
                        DataCell(Text("67%")),
                        DataCell(Text("July 27, 10:15 AM")),
                        DataCell(Text("Monitor")),
                      ],
                    ),
                    DataRow(
                      cells: [
                        DataCell(Text("C3")),
                        DataCell(
                          StatusBadge(status: "Critical"),
                        ),
                        DataCell(Text("91%")),
                        DataCell(Text("July 27, 10:30 AM")),
                        DataCell(Text("Inspect Immediately")),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}