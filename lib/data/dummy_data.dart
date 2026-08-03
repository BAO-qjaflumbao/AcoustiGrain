import '../models/stack_model.dart';

final List<StackModel> warehouseStacks = [

  StackModel(
    stackId: "A1",
    status: "Safe",
    confidence: 98,
    lastScan: "Today 10:00 AM",
    recommendation: "No Action Needed",
  ),

  StackModel(
    stackId: "A2",
    status: "Safe",
    confidence: 96,
    lastScan: "Today 10:05 AM",
    recommendation: "No Action Needed",
  ),

  StackModel(
    stackId: "A3",
    status: "Moderate",
    confidence: 69,
    lastScan: "Today 10:10 AM",
    recommendation: "Monitor",
  ),

  StackModel(
    stackId: "A4",
    status: "Critical",
    confidence: 93,
    lastScan: "Today 10:20 AM",
    recommendation: "Inspect Immediately",
  ),

  StackModel(
    stackId: "A5",
    status: "Not Scanned",
    confidence: 0,
    lastScan: "--",
    recommendation: "Scan Required",
  ),

];