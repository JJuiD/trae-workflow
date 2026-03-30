import subprocess
import sys
import os
import time

processes = []

def start():
    global processes
    cwd = os.path.dirname(os.path.abspath(__file__))

    print("Starting PeerJS Server...")
    peer_process = subprocess.Popen(
        "node node_modules/peer/dist/bin/peerjs.js --port 9001",
        cwd=cwd,
        shell=True
    )
    processes.append(peer_process)
    time.sleep(2)

    print("Starting Game Server...")
    game_process = subprocess.Popen(
        "npx serve .",
        cwd=cwd,
        shell=True
    )
    processes.append(game_process)

    print("\n=== Servers Started ===")
    print("PeerJS:  http://localhost:9001")
    print("Game:    http://localhost:3000")
    print("\nPress Enter to stop all servers\n")

    try:
        input()
    except:
        pass
    stop()

def stop():
    global processes
    print("\nStopping servers...")
    for p in processes:
        try:
            p.terminate()
        except:
            pass
    print("All servers stopped.")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "stop":
        stop()
    else:
        start()
