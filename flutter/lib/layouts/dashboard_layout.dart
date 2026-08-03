import 'package:flutter/material.dart';

import '../widgets/sidebar.dart';
import '../widgets/topbar.dart';

class DashboardLayout extends StatefulWidget {
  final Widget child;
  final int selectedIndex;
  final String title;
  final Function(int) onMenuSelected;

  const DashboardLayout({
    super.key,
    required this.child,
    required this.selectedIndex,
    required this.title,
    required this.onMenuSelected,
  });

  @override
  State<DashboardLayout> createState() => _DashboardLayoutState();
}

class _DashboardLayoutState extends State<DashboardLayout> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [

          /// Sidebar
          Sidebar(
            selectedIndex: widget.selectedIndex,
            onItemSelected: widget.onMenuSelected,
          ),

          /// Main Content
          Expanded(
            child: Column(
              children: [

                /// Top Bar
                TopBar(title: widget.title),

                /// Screen Content
                Expanded(
                  child: Container(
                    color: const Color(0xFFF5F7FA),
                    padding: const EdgeInsets.all(25),
                    child: widget.child,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}