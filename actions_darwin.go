//go:build darwin
// +build darwin

package main

import (
	"bytes"
	"fmt"
	"os/exec"
)

func (as *ActionService) ShowNotification(title, message string) error {
	script := fmt.Sprintf(`display notification "%s" with title "%s"`, message, title)
	cmd := exec.Command("osascript", "-e", script)
	return cmd.Run()
}

func (as *ActionService) OpenURL(url string) error {
	cmd := exec.Command("open", url)
	return cmd.Start()
}

func (as *ActionService) SetClipboard(content string) error {
	cmd := exec.Command("pbcopy")
	cmd.Stdin = bytes.NewBufferString(content)
	return cmd.Run()
}

func (as *ActionService) GetClipboard() (string, error) {
	cmd := exec.Command("pbpaste")
	output, err := cmd.Output()
	if err != nil {
		return "", err
	}
	return string(output), nil
}
