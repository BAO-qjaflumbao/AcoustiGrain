import 'package:flutter/material.dart';

import '../layouts/dashboard_layout.dart';

import 'dashboard.dart';
import 'heatmap.dart';
import 'history.dart';
import 'reports.dart';
import 'settings.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int selectedIndex = 0;

  final List<Widget> pages = const [
    DashboardScreen(),
    HeatMapScreen(),
    HistoryScreen(),
    ReportsScreen(),
    SettingsScreen(),
  ];

  final List<String> titles = const [
    "Dashboard",
    "Warehouse Status Map",
    "Scan History",
    "Reports",
    "Settings",
  ];

  @override
  Widget build(BuildContext context) {
    return DashboardLayout(
      title: titles[selectedIndex],
      selectedIndex: selectedIndex,
      onMenuSelected: (index) {
        setState(() {
          selectedIndex = index;
        });
      },
      child: pages[selectedIndex],
    );
  }
}