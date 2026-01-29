//go:build linux
// +build linux

package main

import (
	"fmt"
	"os/exec"
)

func (as *ActionService) ShowNotification(title, message string) error {
	// Try notify-send (most common on Linux)
	cmd := exec.Command("notify-send", title, message)
	return cmd.Run()
}

func (as *ActionService) OpenURL(url string) error {
	cmd := exec.Command("xdg-open", url)
	return cmd.Start()
}

func (as *ActionService) SetClipboard(content string) error {
	// Try xclip first, then xsel as fallback
	cmd := exec.Command("xclip", "-selection", "clipboard")
	cmd.Stdin = exec.Command("echo", "-n", content).Stdout
	err := cmd.Run()
	if err != nil {
		// Fallback to xsel
		cmd = exec.Command("xsel", "--clipboard", "--input")
		cmd.Stdin = exec.Command("echo", "-n", content).Stdout
		return cmd.Run()
	}
	return nil
}

func (as *ActionService) GetClipboard() (string, error) {
	// Try xclip first, then xsel as fallback
	cmd := exec.Command("xclip", "-selection", "clipboard", "-o")
	output, err := cmd.Output()
	if err != nil {
		// Fallback to xsel
		cmd = exec.Command("xsel", "--clipboard", "--output")
		output, err = cmd.Output()
		if err != nil {
			return "", err
		}
	}
	return string(output), nil
}
