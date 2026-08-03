import 'package:flutter/material.dart';

import 'theme/theme.dart';
import 'screens/home.dart';

void main() {
  runApp(const AcoustiGrainApp());
}

class AcoustiGrainApp extends StatelessWidget {
  const AcoustiGrainApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AcoustiGrain',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const HomeScreen(),
    );
  }
}