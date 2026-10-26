export interface FlutterFile {
  path: string;
  name: string;
  category: 'config' | 'entry' | 'model' | 'database' | 'screen' | 'service' | 'ci';
  description: string;
  code: string;
}

export const FLUTTER_PROJECT_FILES: FlutterFile[] = [
  {
    path: 'pubspec.yaml',
    name: 'pubspec.yaml',
    category: 'config',
    description: 'Project configuration, package name, dependencies (sqflite, fl_chart, csv, path_provider, etc.)',
    code: `name: takatrack
description: "A modern, offline-first personal finance tracker with Bangladeshi Taka (৳) support."
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  # Local SQLite database (100% offline, private)
  sqflite: ^2.3.2
  path_provider: ^2.1.2
  path: ^1.9.0

  # Charts for monthly reports
  fl_chart: ^0.66.2

  # Date & Number formatting
  intl: ^0.19.0

  # CSV Export & File Sharing
  csv: ^6.0.0
  share_plus: ^7.2.2
  file_picker: ^8.0.0

  # Modern Icons & UI utilities
  lucide_icons: ^0.259.0
  google_fonts: ^6.1.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
`
  },
  {
    path: 'lib/main.dart',
    name: 'main.dart',
    category: 'entry',
    description: 'Application entry point, Material 3 theme configuration with Light and Dark mode',
    code: `import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'screens/dashboard_screen.dart';
import 'screens/transactions_screen.dart';
import 'screens/debts_screen.dart';
import 'screens/reports_screen.dart';
import 'screens/settings_screen.dart';
import 'database/db_helper.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Initialize local SQLite database before running app
  await DatabaseHelper.instance.database;
  runApp(const TakaTrackApp());
}

class TakaTrackApp extends StatefulWidget {
  const TakaTrackApp({super.key});

  @override
  State<TakaTrackApp> createState() => _TakaTrackAppState();
}

class _TakaTrackAppState extends State<TakaTrackApp> {
  ThemeMode _themeMode = ThemeMode.system;

  void _toggleTheme(ThemeMode mode) {
    setState(() {
      _themeMode = mode;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TakaTrack',
      debugShowCheckedModeBanner: false,
      themeMode: _themeMode,
      // Premium Clean Light Theme
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0F766E), // Emerald Teal
          brightness: Brightness.light,
          primary: const Color(0xFF0F766E),
          surface: Colors.white,
          background: const Color(0xFFF8FAFC),
        ),
        textTheme: GoogleFonts.plusJakartaSansTextTheme(),
        appBarTheme: const AppBarTheme(
          elevation: 0,
          backgroundColor: Colors.white,
          foregroundColor: Color(0xFF0F172A),
          centerTitle: false,
        ),
      ),
      // Deep Slate Dark Theme
      darkTheme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF14B8A6),
          brightness: Brightness.dark,
          surface: const Color(0xFF1E293B),
          background: const Color(0xFF0F172A),
        ),
        textTheme: GoogleFonts.plusJakartaSansTextTheme(ThemeData.dark().textTheme),
        appBarTheme: const AppBarTheme(
          elevation: 0,
          backgroundColor: Color(0xFF1E293B),
          foregroundColor: Colors.white,
          centerTitle: false,
        ),
      ),
      home: MainNavigationShell(onToggleTheme: _toggleTheme, currentThemeMode: _themeMode),
    );
  }
}

class MainNavigationShell extends StatefulWidget {
  final Function(ThemeMode) onToggleTheme;
  final ThemeMode currentThemeMode;

  const MainNavigationShell({
    super.key,
    required this.onToggleTheme,
    required this.currentThemeMode,
  });

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;

  final List<Widget> _pages = const [
    DashboardScreen(),
    TransactionsScreen(),
    DebtsScreen(),
    ReportsScreen(),
    SettingsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(LucideIcons.layoutDashboard),
            selectedIcon: Icon(LucideIcons.layoutDashboard, color: Color(0xFF0F766E)),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.receipt),
            selectedIcon: Icon(LucideIcons.receipt, color: Color(0xFF0F766E)),
            label: 'History',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.arrowLeftRight),
            selectedIcon: Icon(LucideIcons.arrowLeftRight, color: Color(0xFF0F766E)),
            label: 'Debts',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.barChart3),
            selectedIcon: Icon(LucideIcons.barChart3, color: Color(0xFF0F766E)),
            label: 'Reports',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.settings),
            selectedIcon: Icon(LucideIcons.settings, color: Color(0xFF0F766E)),
            label: 'Settings',
          ),
        ],
      ),
    );
  }
}
`
  },
  {
    path: 'lib/models/transaction_model.dart',
    name: 'transaction_model.dart',
    category: 'model',
    description: 'Transaction entity with validation and SQLite serialization',
    code: `enum TransactionType { income, expense }

class TransactionModel {
  final int? id;
  final TransactionType type;
  final double amount;
  final String category; // food, transport, shopping, bills, salary, other, etc.
  final DateTime date;
  final String note;
  final int createdAt;

  TransactionModel({
    this.id,
    required this.type,
    required this.amount,
    required this.category,
    required this.date,
    required this.note,
    required this.createdAt,
  });

  // Accurate monetary validation
  static String? validateAmount(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Amount is required';
    }
    final parsed = double.tryParse(value.trim());
    if (parsed == null || parsed <= 0) {
      return 'Enter a valid amount greater than 0';
    }
    if (parsed > 1000000000) {
      return 'Amount exceeds maximum limit';
    }
    return null;
  }

  // Convert to SQLite Map
  Map<String, dynamic> toMap() {
    return {
      if (id != null) 'id': id,
      'type': type.name,
      'amount': amount,
      'category': category,
      'date': date.toIso8601String().substring(0, 10), // YYYY-MM-DD
      'note': note,
      'createdAt': createdAt,
    };
  }

  // Create from SQLite Map
  factory TransactionModel.fromMap(Map<String, dynamic> map) {
    return TransactionModel(
      id: map['id'] as int?,
      type: map['type'] == 'income' ? TransactionType.income : TransactionType.expense,
      amount: (map['amount'] as num).toDouble(),
      category: map['category'] as String,
      date: DateTime.parse(map['date'] as String),
      note: (map['note'] ?? '') as String,
      createdAt: map['createdAt'] as int? ?? DateTime.now().millisecondsSinceEpoch,
    );
  }
}
`
  },
  {
    path: 'lib/models/debt_model.dart',
    name: 'debt_model.dart',
    category: 'model',
    description: 'Debt model for tracking lent and borrowed money with partial repayments',
    code: `enum DebtType { lent, borrowed } // lent = I gave money, borrowed = I took money
enum DebtStatus { pending, partiallyPaid, settled }

class DebtModel {
  final int? id;
  final DebtType type;
  final String personName;
  final String? phone;
  final double amount;
  final double paidAmount;
  final DateTime date;
  final DateTime? dueDate;
  final String note;
  final DebtStatus status;
  final int createdAt;

  DebtModel({
    this.id,
    required this.type,
    required this.personName,
    this.phone,
    required this.amount,
    this.paidAmount = 0.0,
    required this.date,
    this.dueDate,
    this.note = '',
    this.status = DebtStatus.pending,
    required this.createdAt,
  });

  double get remainingAmount => (amount - paidAmount).clamp(0.0, amount);
  bool get isSettled => status == DebtStatus.settled || remainingAmount <= 0.001;

  Map<String, dynamic> toMap() {
    return {
      if (id != null) 'id': id,
      'type': type.name,
      'personName': personName,
      'phone': phone,
      'amount': amount,
      'paidAmount': paidAmount,
      'date': date.toIso8601String().substring(0, 10),
      'dueDate': dueDate?.toIso8601String().substring(0, 10),
      'note': note,
      'status': status.name,
      'createdAt': createdAt,
    };
  }

  factory DebtModel.fromMap(Map<String, dynamic> map) {
    return DebtModel(
      id: map['id'] as int?,
      type: map['type'] == 'lent' ? DebtType.lent : DebtType.borrowed,
      personName: map['personName'] as String,
      phone: map['phone'] as String?,
      amount: (map['amount'] as num).toDouble(),
      paidAmount: ((map['paidAmount'] ?? 0) as num).toDouble(),
      date: DateTime.parse(map['date'] as String),
      dueDate: map['dueDate'] != null ? DateTime.parse(map['dueDate'] as String) : null,
      note: (map['note'] ?? '') as String,
      status: _parseStatus(map['status'] as String?),
      createdAt: map['createdAt'] as int? ?? DateTime.now().millisecondsSinceEpoch,
    );
  }

  static DebtStatus _parseStatus(String? statusStr) {
    if (statusStr == 'settled') return DebtStatus.settled;
    if (statusStr == 'partiallyPaid' || statusStr == 'partially_paid') return DebtStatus.partiallyPaid;
    return DebtStatus.pending;
  }
}
`
  },
  {
    path: 'lib/database/db_helper.dart',
    name: 'db_helper.dart',
    category: 'database',
    description: 'SQLite database implementation with schema creation, CRUD operations, and queries',
    code: `import 'dart:io';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';
import 'package:sqflite/sqflite.dart';
import '../models/transaction_model.dart';
import '../models/debt_model.dart';

class DatabaseHelper {
  static const _databaseName = "takatrack_local.db";
  static const _databaseVersion = 1;

  // Singleton instance
  DatabaseHelper._privateConstructor();
  static final DatabaseHelper instance = DatabaseHelper._privateConstructor();

  static Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    Directory documentsDirectory = await getApplicationDocumentsDirectory();
    String path = join(documentsDirectory.path, _databaseName);

    return await openDatabase(
      path,
      version: _databaseVersion,
      onCreate: _onCreate,
    );
  }

  Future _onCreate(Database db, int version) async {
    // 1. Transactions Table
    await db.execute('''
      CREATE TABLE transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        note TEXT,
        createdAt INTEGER NOT NULL
      )
    ''');

    // 2. Debts Table (Money Lent & Borrowed)
    await db.execute('''
      CREATE TABLE debts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        personName TEXT NOT NULL,
        phone TEXT,
        amount REAL NOT NULL,
        paidAmount REAL NOT NULL DEFAULT 0.0,
        date TEXT NOT NULL,
        dueDate TEXT,
        note TEXT,
        status TEXT NOT NULL,
        createdAt INTEGER NOT NULL
      )
    ''');

    // Create indices for fast date queries
    await db.execute('CREATE INDEX idx_transactions_date ON transactions(date);');
    await db.execute('CREATE INDEX idx_debts_status ON debts(status);');
  }

  // ================= Transactions CRUD =================

  Future<int> insertTransaction(TransactionModel transaction) async {
    Database db = await database;
    return await db.insert('transactions', transaction.toMap());
  }

  Future<List<TransactionModel>> getAllTransactions() async {
    Database db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'transactions',
      orderBy: 'date DESC, id DESC',
    );
    return List.generate(maps.length, (i) => TransactionModel.fromMap(maps[i]));
  }

  Future<List<TransactionModel>> getTransactionsByMonth(String yearMonth) async {
    Database db = await database;
    // yearMonth format: 'YYYY-MM'
    final List<Map<String, dynamic>> maps = await db.query(
      'transactions',
      where: 'date LIKE ?',
      whereArgs: ['\$yearMonth%'],
      orderBy: 'date DESC, id DESC',
    );
    return List.generate(maps.length, (i) => TransactionModel.fromMap(maps[i]));
  }

  Future<int> updateTransaction(TransactionModel transaction) async {
    Database db = await database;
    return await db.update(
      'transactions',
      transaction.toMap(),
      where: 'id = ?',
      whereArgs: [transaction.id],
    );
  }

  Future<int> deleteTransaction(int id) async {
    Database db = await database;
    return await db.delete(
      'transactions',
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // Accurate Financial Calculations
  Future<Map<String, double>> getMonthlySummary(String yearMonth) async {
    Database db = await database;
    
    // Total Income for month
    final incomeResult = await db.rawQuery('''
      SELECT SUM(amount) as total FROM transactions 
      WHERE type = 'income' AND date LIKE ?
    ''', ['\$yearMonth%']);

    // Total Expense for month
    final expenseResult = await db.rawQuery('''
      SELECT SUM(amount) as total FROM transactions 
      WHERE type = 'expense' AND date LIKE ?
    ''', ['\$yearMonth%']);

    // Overall Balance (All time)
    final allIncome = await db.rawQuery("SELECT SUM(amount) as total FROM transactions WHERE type = 'income'");
    final allExpense = await db.rawQuery("SELECT SUM(amount) as total FROM transactions WHERE type = 'expense'");

    double totalIncome = (allIncome.first['total'] as num?)?.toDouble() ?? 0.0;
    double totalExpense = (allExpense.first['total'] as num?)?.toDouble() ?? 0.0;
    double monthlyIncome = (incomeResult.first['total'] as num?)?.toDouble() ?? 0.0;
    double monthlyExpense = (expenseResult.first['total'] as num?)?.toDouble() ?? 0.0;

    return {
      'totalBalance': totalIncome - totalExpense,
      'monthlyIncome': monthlyIncome,
      'monthlyExpense': monthlyExpense,
    };
  }

  // ================= Debts CRUD =================

  Future<int> insertDebt(DebtModel debt) async {
    Database db = await database;
    return await db.insert('debts', debt.toMap());
  }

  Future<List<DebtModel>> getAllDebts() async {
    Database db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'debts',
      orderBy: 'createdAt DESC',
    );
    return List.generate(maps.length, (i) => DebtModel.fromMap(maps[i]));
  }

  Future<int> updateDebt(DebtModel debt) async {
    Database db = await database;
    return await db.update(
      'debts',
      debt.toMap(),
      where: 'id = ?',
      whereArgs: [debt.id],
    );
  }

  Future<int> deleteDebt(int id) async {
    Database db = await database;
    return await db.delete(
      'debts',
      where: 'id = ?',
      whereArgs: [id],
    );
  }
}
`
  },
  {
    path: 'lib/screens/dashboard_screen.dart',
    name: 'dashboard_screen.dart',
    category: 'screen',
    description: 'Dashboard screen showing Total Balance in ৳, Monthly Income/Expense cards, and quick actions',
    code: `import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../database/db_helper.dart';
import '../models/transaction_model.dart';
import 'add_transaction_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  double _totalBalance = 0.0;
  double _monthlyIncome = 0.0;
  double _monthlyExpense = 0.0;
  List<TransactionModel> _recentTransactions = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    final now = DateTime.now();
    final yearMonth = DateFormat('yyyy-MM').format(now);

    final summary = await DatabaseHelper.instance.getMonthlySummary(yearMonth);
    final allTx = await DatabaseHelper.instance.getAllTransactions();

    setState(() {
      _totalBalance = summary['totalBalance'] ?? 0.0;
      _monthlyIncome = summary['monthlyIncome'] ?? 0.0;
      _monthlyExpense = summary['monthlyExpense'] ?? 0.0;
      _recentTransactions = allTx.take(5).toList();
      _isLoading = false;
    });
  }

  String _formatTaka(double amount) {
    final formatter = NumberFormat.currency(
      locale: 'en_IN',
      symbol: '৳',
      decimalDigits: 0,
    );
    return formatter.format(amount);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF0F766E).withOpacity(0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(LucideIcons.wallet, color: Color(0xFF0F766E), size: 20),
            ),
            const SizedBox(width: 10),
            const Text(
              'TakaTrack',
              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw, size: 20),
            onPressed: _loadDashboardData,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadDashboardData,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // 1. Total Balance Card (Bangladeshi Taka ৳)
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF0F766E), Color(0xFF115E59)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF0F766E).withOpacity(0.25),
                          blurRadius: 16,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'TOTAL BALANCE',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 1.1,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _formatTaka(_totalBalance),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 32,
                            fontWeight: FontWeight.w800,
                            fontFamily: 'monospace',
                          ),
                        ),
                        const SizedBox(height: 20),
                        // Monthly Income & Expense Row
                        Row(
                          children: [
                            Expanded(
                              child: Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.12),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(LucideIcons.arrowDownLeft, color: Color(0xFF86EFAC), size: 18),
                                    const SizedBox(width: 8),
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Text('Income', style: TextStyle(color: Colors.white70, fontSize: 11)),
                                        Text(
                                          _formatTaka(_monthlyIncome),
                                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.12),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(LucideIcons.arrowUpRight, color: Color(0xFFFCA5A5), size: 18),
                                    const SizedBox(width: 8),
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Text('Expense', style: TextStyle(color: Colors.white70, fontSize: 11)),
                                        Text(
                                          _formatTaka(_monthlyExpense),
                                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Quick Action Buttons
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () async {
                            final res = await Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => const AddTransactionScreen(initialType: TransactionType.expense),
                              ),
                            );
                            if (res == true) _loadDashboardData();
                          },
                          icon: const Icon(LucideIcons.minusCircle, size: 18, color: Colors.white),
                          label: const Text('Add Expense'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFDC2626),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () async {
                            final res = await Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => const AddTransactionScreen(initialType: TransactionType.income),
                              ),
                            );
                            if (res == true) _loadDashboardData();
                          },
                          icon: const Icon(LucideIcons.plusCircle, size: 18, color: Colors.white),
                          label: const Text('Add Income'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF0F766E),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 24),

                  // Recent Transactions Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Recent Transactions',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        '\${_recentTransactions.length} records',
                        style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  if (_recentTransactions.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(32),
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF1E293B) : Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: isDark ? Colors.white10 : Colors.black12),
                      ),
                      child: Column(
                        children: [
                          Icon(LucideIcons.receipt, size: 40, color: Colors.grey.shade400),
                          const SizedBox(height: 8),
                          const Text('No transactions yet', style: TextStyle(fontWeight: FontWeight.w600)),
                          const SizedBox(height: 4),
                          Text(
                            'Tap Add Expense or Add Income to start tracking',
                            style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                          ),
                        ],
                      ),
                    )
                  else
                    ..._recentTransactions.map((tx) {
                      final isIncome = tx.type == TransactionType.income;
                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF1E293B) : Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: isDark ? Colors.white10 : Colors.black12),
                        ),
                        child: ListTile(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                          leading: CircleAvatar(
                            backgroundColor: isIncome
                                ? const Color(0xFF10B981).withOpacity(0.12)
                                : const Color(0xFFEF4444).withOpacity(0.12),
                            child: Icon(
                              isIncome ? LucideIcons.arrowDownLeft : LucideIcons.arrowUpRight,
                              color: isIncome ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                              size: 18,
                            ),
                          ),
                          title: Text(
                            tx.note.isNotEmpty ? tx.note : tx.category.toUpperCase(),
                            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                          ),
                          subtitle: Text(
                            '\${DateFormat('dd MMM yyyy').format(tx.date)} · \${tx.category}',
                            style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                          ),
                          trailing: Text(
                            '\${isIncome ? '+' : '-'}\${_formatTaka(tx.amount)}',
                            style: TextStyle(
                              color: isIncome ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                              fontWeight: FontWeight.w700,
                              fontSize: 15,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ),
                      );
                    }),
                ],
              ),
            ),
    );
  }
}
`
  },
  {
    path: 'lib/screens/add_transaction_screen.dart',
    name: 'add_transaction_screen.dart',
    category: 'screen',
    description: 'Transaction form with validation, date picker, and category selection',
    code: `import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../database/db_helper.dart';
import '../models/transaction_model.dart';

class AddTransactionScreen extends StatefulWidget {
  final TransactionType initialType;

  const AddTransactionScreen({super.key, this.initialType = TransactionType.expense});

  @override
  State<AddTransactionScreen> createState() => _AddTransactionScreenState();
}

class _AddTransactionScreenState extends State<AddTransactionScreen> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _noteController = TextEditingController();

  late TransactionType _type;
  String _selectedCategory = 'food';
  DateTime _selectedDate = DateTime.now();

  final List<Map<String, dynamic>> _categories = [
    {'id': 'food', 'name': 'Food & Bazar', 'icon': LucideIcons.utensils},
    {'id': 'transport', 'name': 'Transport', 'icon': LucideIcons.car},
    {'id': 'shopping', 'name': 'Shopping', 'icon': LucideIcons.shoppingBag},
    {'id': 'bills', 'name': 'Bills & Utilities', 'icon': LucideIcons.receipt},
    {'id': 'salary', 'name': 'Salary & Income', 'icon': LucideIcons.briefcase},
    {'id': 'health', 'name': 'Health & Medicine', 'icon': LucideIcons.activity},
    {'id': 'education', 'name': 'Education', 'icon': LucideIcons.bookOpen},
    {'id': 'entertainment', 'name': 'Entertainment', 'icon': LucideIcons.film},
    {'id': 'other', 'name': 'Other', 'icon': LucideIcons.moreHorizontal},
  ];

  @override
  void initState() {
    super.initState();
    _type = widget.initialType;
    if (_type == TransactionType.income) {
      _selectedCategory = 'salary';
    }
  }

  @override
  void dispose() {
    _amountController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2020),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  Future<void> _saveTransaction() async {
    if (!_formKey.currentState!.validate()) return;

    final amount = double.parse(_amountController.text.trim());
    final tx = TransactionModel(
      type: _type,
      amount: amount,
      category: _selectedCategory,
      date: _selectedDate,
      note: _noteController.text.trim(),
      createdAt: DateTime.now().millisecondsSinceEpoch,
    );

    await DatabaseHelper.instance.insertTransaction(tx);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Transaction saved successfully!')),
      );
      Navigator.pop(context, true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_type == TransactionType.income ? 'Add Income' : 'Add Expense'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Income vs Expense Segment
            SegmentedButton<TransactionType>(
              segments: const [
                ButtonSegment(
                  value: TransactionType.expense,
                  label: Text('Expense'),
                  icon: Icon(LucideIcons.arrowUpRight),
                ),
                ButtonSegment(
                  value: TransactionType.income,
                  label: Text('Income'),
                  icon: Icon(LucideIcons.arrowDownLeft),
                ),
              ],
              selected: {_type},
              onSelectionChanged: (val) {
                setState(() {
                  _type = val.first;
                  if (_type == TransactionType.income && _selectedCategory == 'food') {
                    _selectedCategory = 'salary';
                  }
                });
              },
            ),

            const SizedBox(height: 20),

            // Amount Input with ৳ symbol
            TextFormField(
              controller: _amountController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              validator: TransactionModel.validateAmount,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              decoration: InputDecoration(
                prefixText: '৳ ',
                prefixStyle: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                labelText: 'Amount (BDT)',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                filled: true,
              ),
            ),

            const SizedBox(height: 16),

            // Category Picker
            DropdownButtonFormField<String>(
              value: _selectedCategory,
              decoration: InputDecoration(
                labelText: 'Category',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                filled: true,
              ),
              items: _categories.map((c) {
                return DropdownMenuItem<String>(
                  value: c['id'] as String,
                  child: Row(
                    children: [
                      Icon(c['icon'] as IconData, size: 18),
                      const SizedBox(width: 8),
                      Text(c['name'] as String),
                    ],
                  ),
                );
              }).toList(),
              onChanged: (val) {
                if (val != null) setState(() => _selectedCategory = val);
              },
            ),

            const SizedBox(height: 16),

            // Date Picker Row
            ListTile(
              tileColor: Theme.of(context).cardColor,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(color: Colors.grey.shade300),
              ),
              leading: const Icon(LucideIcons.calendar),
              title: const Text('Date'),
              subtitle: Text(DateFormat('EEEE, dd MMMM yyyy').format(_selectedDate)),
              trailing: const Icon(LucideIcons.chevronRight, size: 18),
              onTap: _pickDate,
            ),

            const SizedBox(height: 16),

            // Notes field
            TextFormField(
              controller: _noteController,
              maxLines: 2,
              decoration: InputDecoration(
                labelText: 'Notes (optional)',
                hintText: 'e.g. Bazar, Rickshaw rent, Grocery items',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                filled: true,
              ),
            ),

            const SizedBox(height: 32),

            // Save Button
            ElevatedButton(
              onPressed: _saveTransaction,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0F766E),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Save Transaction', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}
`
  },
  {
    path: 'lib/screens/debts_screen.dart',
    name: 'debts_screen.dart',
    category: 'screen',
    description: 'Track money lent to others and money borrowed from others with repayment ledger',
    code: `import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../database/db_helper.dart';
import '../models/debt_model.dart';

class DebtsScreen extends StatefulWidget {
  const DebtsScreen({super.key});

  @override
  State<DebtsScreen> createState() => _DebtsScreenState();
}

class _DebtsScreenState extends State<DebtsScreen> {
  List<DebtModel> _debts = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadDebts();
  }

  Future<void> _loadDebts() async {
    final list = await DatabaseHelper.instance.getAllDebts();
    setState(() {
      _debts = list;
      _isLoading = false;
    });
  }

  double get _totalLent => _debts
      .where((d) => d.type == DebtType.lent)
      .fold(0.0, (sum, d) => sum + d.remainingAmount);

  double get _totalBorrowed => _debts
      .where((d) => d.type == DebtType.borrowed)
      .fold(0.0, (sum, d) => sum + d.remainingAmount);

  String _formatTaka(double amount) {
    return NumberFormat.currency(locale: 'en_IN', symbol: '৳', decimalDigits: 0).format(amount);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Lent & Borrowed (ধার/দেনা)'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Summary Cards
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Money Lent (পাওনা)', style: TextStyle(fontSize: 12, color: Color(0xFF047857), fontWeight: FontWeight.w600)),
                            const SizedBox(height: 6),
                            Text(_formatTaka(_totalLent), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
                            const Text('To receive', style: TextStyle(fontSize: 11, color: Colors.grey)),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEF4444).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.3)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Money Borrowed (দেনা)', style: TextStyle(fontSize: 12, color: Color(0xFFB91C1C), fontWeight: FontWeight.w600)),
                            const SizedBox(height: 6),
                            Text(_formatTaka(_totalBorrowed), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
                            const Text('To repay', style: TextStyle(fontSize: 11, color: Colors.grey)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                const Text('All Records', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                if (_debts.isEmpty)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.all(32),
                      child: Text('No lent or borrowed records found.'),
                    ),
                  )
                else
                  ..._debts.map((debt) => Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    debt.personName,
                                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                  ),
                                  Text(
                                    debt.type == DebtType.lent ? 'LENT' : 'BORROWED',
                                    style: TextStyle(
                                      color: debt.type == DebtType.lent ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text('Total: \${_formatTaka(debt.amount)} | Remaining: \${_formatTaka(debt.remainingAmount)}'),
                              if (debt.note.isNotEmpty) ...[
                                const SizedBox(height: 4),
                                Text(debt.note, style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
                              ],
                            ],
                          ),
                        ),
                      )),
              ],
            ),
    );
  }
}
`
  },
  {
    path: 'lib/services/csv_service.dart',
    name: 'csv_service.dart',
    category: 'service',
    description: 'Export transaction records to standard CSV file for phone spreadsheet use',
    code: `import 'dart:io';
import 'package:csv/csv.dart';
import 'package:intl/intl.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import '../models/transaction_model.dart';

class CsvService {
  static Future<String> exportTransactionsToCsv(List<TransactionModel> transactions) async {
    List<List<dynamic>> rows = [];

    // Header row
    rows.add([
      'ID',
      'Date',
      'Type',
      'Category',
      'Amount (BDT ৳)',
      'Notes',
    ]);

    for (var tx in transactions) {
      rows.add([
        tx.id ?? '',
        DateFormat('yyyy-MM-dd').format(tx.date),
        tx.type.name.toUpperCase(),
        tx.category,
        tx.amount,
        tx.note,
      ]);
    }

    String csvData = const ListToCsvConverter().convert(rows);

    final directory = await getApplicationDocumentsDirectory();
    final path = '\${directory.path}/TakaTrack_Export_\${DateFormat('yyyyMMdd_HHmm').format(DateTime.now())}.csv';
    final file = File(path);
    await file.writeAsString(csvData);

    // Share or open CSV file on Android phone
    await Share.shareXFiles([XFile(path)], text: 'TakaTrack Financial Transactions CSV');

    return path;
  }
}
`
  },
  {
    path: '.github/workflows/build-apk.yml',
    name: 'build-apk.yml',
    category: 'ci',
    description: 'Free Cloud APK Builder: Triggers from your Android phone browser with 0 computer needed',
    code: `name: Build Android APK

on:
  workflow_dispatch: # Can be triggered manually from your phone's browser!
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout Code
      uses: actions/checkout@v4

    - name: Setup Java JDK
      uses: actions/setup-java@v4
      with:
        distribution: 'temurin'
        java-version: '17'

    - name: Setup Flutter
      uses: subosito/flutter-action@v2
      with:
        flutter-version: '3.19.6'
        channel: 'stable'

    - name: Get Dependencies
      run: flutter pub get

    - name: Build Release APK
      run: flutter build apk --release --split-per-abi

    - name: Upload APK Artifact
      uses: actions/upload-artifact@v4
      with:
        name: TakaTrack-Release-APK
        path: build/app/outputs/flutter-apk/*.apk
`
  }
];
