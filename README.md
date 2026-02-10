# 🌲 MindDash

**MindDash** is a retro-style 2D RPG survival game developed with **React Native** and **Expo**. Guide Finn through an infinite forest, battle spectral enemies, manage your vitals, and locate the portal to escape to the next level.

## 🎮 Game Features

* **Infinite Progression:** Procedurally selected maps ensure a fresh experience every time you cross a portal.
* **Roguelite Elements:**
    * **Persistent Health:** Damage carries over between levels. Every heart counts!
    * **Cumulative Stats:** Your kill count and survival time stack across levels.
* **Combat System:**
    * **Dash Mechanic:** Use bursts of speed to dodge enemies or reposition quickly.
    * **Melee Attack:** Defeat ghosts using your weapon with precise timing.
* **Polished UI:** Custom pixel-art menus, credits window, loading screens, and a robust pause system.
* **Immersive Audio:** Dynamic background music and SFX via `expo-av`.

---

## 🧠 Artificial Intelligence System

MindDash features a **Finite State Machine (FSM)** to control enemy behavior, making encounters unpredictable and challenging.

### How it Works
The AI operates on two primary states:
1.  **Patrol State:** Enemies move randomly within a designated area when the player is out of range.
2.  **Chase State:** Once the player enters the "Detection Radius," the AI calculates the vector between its position and Finn's, switching to an aggressive pursuit mode.

### Token & Resource Management (Backup Plan)
To ensure the game remains functional even under heavy load or API limitations:
* **Local Processing:** The core AI logic runs locally on the device's main thread within the `react-native-game-engine` loop. This ensures 0ms latency and avoids dependency on external credits.
* **Fallback Strategy:** If the project scales to use cloud-based features and tokens are exhausted, the system automatically triggers **"Simplified Logic Mode."** This switches behavior to lightweight, linear pathfinding to preserve performance and ensure the game remains 100% playable offline.

---

## 🛠 Tech Stack

* **Framework:** [React Native](https://reactnative.dev/) (Expo SDK 52)
* **Engine:** `react-native-game-engine`
* **Audio:** `expo-av`
* **Navigation:** React Navigation
* **Art:** Custom Pixel Art

## 🚀 Installation & Setup

**Prerequisites:** Ensure you have [Node.js](https://nodejs.org/) installed.

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/javeth33/MindDash.git](https://github.com/javeth33/MindDash.git)
    cd MindDash
    ```

2.  **Install dependencies:**
    ```bash
    npx expo install
    ```

3.  **Launch the project:**
    ```bash
    npx expo start --clear
    ```

4.  **How to Play:**
    * Scan the QR code with the **Expo Go** app (Android/iOS).
    * Press `a` for Android Emulator or `i` for iOS Simulator.

## 🕹 Controls

| Action | Control |
| :--- | :--- |
| **Movement** | On-screen D-Pad |
| **Attack** | Red Button (Sword Icon) |
| **Dash** | Blue Button (Boot Icon) |
| **Pause** | Top-left Pause Button |

## 👥 Credits

* **DJ** - Full Stack Developer
* **GS** - Full Stack Developer
* **AS** - Frontend Developer

---
