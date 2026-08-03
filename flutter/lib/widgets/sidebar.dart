import 'package:flutter/material.dart';

class Sidebar extends StatelessWidget {
  final int selectedIndex;
  final Function(int) onItemSelected;

  const Sidebar({
    super.key,
    required this.selectedIndex,
    required this.onItemSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 255,
      color: const Color(0xFF1F2937),
      child: Column(
        children: [
          const SizedBox(height: 30),

          // Logo
          const Icon(
            Icons.grass,
            color: Colors.green,
            size: 50,
          ),

          const SizedBox(height: 10),

          const Text(
            "AcoustiGrain",
            style: TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),

          const SizedBox(height: 40),

          _buildMenuItem(
            icon: Icons.dashboard,
            title: "Dashboard",
            index: 0,
          ),

          _buildMenuItem(
            icon: Icons.grid_view,
            title: "Warehouse Status Map",
            index: 1,
          ),

          _buildMenuItem(
            icon: Icons.history,
            title: "Scan History",
            index: 2,
          ),

          _buildMenuItem(
            icon: Icons.bar_chart,
            title: "Reports",
            index: 3,
          ),

          _buildMenuItem(
            icon: Icons.settings,
            title: "Settings",
            index: 4,
          ),

          const Spacer(),

          const Divider(
            color: Colors.white24,
            thickness: 1,
            indent: 20,
            endIndent: 20,
          ),

          const Padding(
            padding: EdgeInsets.symmetric(vertical: 20),
            child: Text(
              "Version 1.0",
              style: TextStyle(
                color: Colors.white54,
                fontSize: 14,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required int index,
  }) {
    final bool selected = selectedIndex == index;

    return InkWell(
      onTap: () => onItemSelected(index),
      borderRadius: BorderRadius.circular(10),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.symmetric(
          horizontal: 12,
          vertical: 5,
        ),
        padding: const EdgeInsets.symmetric(
          horizontal: 15,
          vertical: 12,
        ),
        decoration: BoxDecoration(
          color: selected
              ? Colors.green.withOpacity(0.20)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: 22,
              color: selected ? Colors.green : Colors.white,
            ),

            const SizedBox(width: 15),

            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  color: selected ? Colors.green : Colors.white,
                  fontSize: 16,
                  fontWeight:
                      selected ? FontWeight.w600 : FontWeight.normal,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}