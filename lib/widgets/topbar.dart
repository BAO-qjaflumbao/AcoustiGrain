import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class TopBar extends StatelessWidget {
  final String title;

  const TopBar({
    super.key,
    required this.title,
  });

  @override
  Widget build(BuildContext context) {
    final String today =
        DateFormat('EEEE, MMMM d, yyyy').format(DateTime.now());

    return Container(
      height: 70,
      padding: const EdgeInsets.symmetric(horizontal: 30),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(
          bottom: BorderSide(
            color: Color(0xFFE5E7EB),
          ),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [

          /// Left Side
          Text(
            title,
            style: const TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.bold,
            ),
          ),

          /// Right Side
          Row(
            children: [

              const Icon(
                Icons.calendar_today,
                size: 18,
                color: Colors.grey,
              ),

              const SizedBox(width: 8),

              Text(
                today,
                style: const TextStyle(
                  color: Colors.grey,
                ),
              ),

            ],
          )
        ],
      ),
    );
  }
}