import 'package:flutter/material.dart';

import '../models/stack_model.dart';

class StackDialog extends StatelessWidget {
  final StackModel stack;

  const StackDialog({
    super.key,
    required this.stack,
  });

  Color getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case "safe":
        return Colors.green;

      case "moderate":
        return Colors.orange;

      case "critical":
        return Colors.red;

      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(
        "Stack ${stack.stackId}",
        style: const TextStyle(
          fontWeight: FontWeight.bold,
        ),
      ),
      content: SizedBox(
        width: 350,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [

            Row(
              children: [
                const Icon(Icons.inventory_2),
                const SizedBox(width: 10),
                Text(
                  stack.stackId,
                  style: const TextStyle(fontSize: 18),
                ),
              ],
            ),

            const SizedBox(height: 20),

            Row(
              children: [
                Icon(
                  Icons.circle,
                  color: getStatusColor(stack.status),
                  size: 14,
                ),
                const SizedBox(width: 10),
                Text(
                  stack.status,
                  style: TextStyle(
                    color: getStatusColor(stack.status),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),

            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.analytics),
              title: const Text("Confidence"),
              subtitle: Text("${stack.confidence}%"),
            ),

            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.access_time),
              title: const Text("Last Scan"),
              subtitle: Text(stack.lastScan),
            ),

            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.lightbulb_outline),
              title: const Text("Recommendation"),
              subtitle: Text(stack.recommendation),
            ),
          ],
        ),
      ),
      actions: [
        FilledButton(
          onPressed: () {
            Navigator.pop(context);
          },
          child: const Text("Close"),
        ),
      ],
    );
  }
}