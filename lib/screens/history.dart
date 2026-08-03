import 'package:flutter/material.dart';

import '../data/dummy_data.dart';
import '../widgets/status_badge.dart';

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Scan History",
            style: TextStyle(
              fontSize: 30,
              fontWeight: FontWeight.bold,
            ),
          ),

          const SizedBox(height: 8),

          const Text(
            "View previous scan records of rice stacks.",
            style: TextStyle(
              color: Colors.grey,
              fontSize: 16,
            ),
          ),

          const SizedBox(height: 25),

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
                  rows: warehouseStacks.map((stack) {
                    return DataRow(
                      cells: [
                        DataCell(Text(stack.stackId)),
                        DataCell(
                          StatusBadge(status: stack.status),
                        ),
                        DataCell(Text("${stack.confidence}%")),
                        DataCell(Text(stack.lastScan)),
                        DataCell(Text(stack.recommendation)),
                      ],
                    );
                  }).toList(),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}