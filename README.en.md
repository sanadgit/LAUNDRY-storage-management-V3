# 🧺 Laundry Storage Management V3

**Developer:** [sanadgit](https://github.com/sanadgit)

An advanced system for managing and monitoring laundry and clothing storage with a 3D interface and cloud-based data storage.

---

## 📋 Project Overview

This project provides an integrated solution for warehouse and storage management with:
- 📦 Efficient inventory and storage management
- 🎯 3D visualization of the warehouse
- 🔍 Advanced product search system
- 📊 Comprehensive monitoring dashboard
- ☁️ Cloud data storage (Supabase)
- 🎨 Modern and user-friendly interface

---

## 🛠️ Requirements

- **Node.js** (version 16 or later)
- **npm** or **yarn**
- **Supabase** account (optional - for cloud storage)

---

## 🚀 Installation and Running

### 1. Clone the Repository
```bash
git clone https://github.com/sanadgit/LAUNDRY-storage-management-V3.git
cd LAUNDRY-storage-management-V3
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create a Local `.env` File
Create a `.env` file in the project root based on `.env.example`:
```env
VITE_SUPABASE_ENABLED=true
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the Application
```bash
npm run dev
```

The application will open at `http://localhost:5173`

---

## 📂 Project Structure

```
src/
├── components/        # React components
├── context/          # State management
├── constants/        # Constants and settings
├── lib/              # Libraries and clients
├── pages/            # Main pages
├── server/           # Server scripts
├── store/            # Store management
└── utils/            # Helper functions
```

---

## 🎯 Key Features

- ✅ **Warehouse Management**: Organize and track products
- ✅ **3D View**: Visual representation of the warehouse
- ✅ **Search System**: Quick product search
- ✅ **Control Panel**: Real-time reports and statistics
- ✅ **Cloud Integration**: Supabase for reliable data

---

## 🔧 Available Commands

- `npm run dev` - Run the development server
- `npm run build` - Build the app for production
- `npm run preview` - Preview the production build

---

## 📦 Libraries Used

- **React 18** - UI library
- **TypeScript** - Type-safe programming language
- **Vite** - Fast build tool
- **Supabase** - Cloud database
- **Three.js** - 3D graphics

---

## 📝 License

This project is licensed under the **MIT License** - an open-source license that allows free use of the project.
See the [LICENSE](LICENSE) file for full details.

---

**Last Updated:** April 17, 2026
