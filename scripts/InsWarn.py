import tkinter as tk
from tkinter import messagebox

def main():
    root = tk.Tk()
    root.withdraw()
    messagebox.showwarning(title="PSJ Documentation", message="An instance of PSJ Documentation is already running!")

if __name__ == "__main__":
    main()