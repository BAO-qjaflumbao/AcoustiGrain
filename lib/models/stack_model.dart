class StackModel {
  final String stackId;
  final String status;
  final int confidence;
  final String lastScan;
  final String recommendation;

  const StackModel({
    required this.stackId,
    required this.status,
    required this.confidence,
    required this.lastScan,
    required this.recommendation,
  });
}