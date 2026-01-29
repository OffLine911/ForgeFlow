//go:build windows
// +build windows

package main

import (
	"fmt"
	"os/exec"
	"syscall"
)

func (as *ActionService) ShowNotification(title, message string) error {
	script := fmt.Sprintf(`
		[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
		[Windows.UI.Notifications.ToastNotification, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
		[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
		
		$template = @"
		<toast>
			<visual>
				<binding template="ToastText02">
					<text id="1">%s</text>
					<text id="2">%s</text>
				</binding>
			</visual>
		</toast>
"@
		
		$xml = New-Object Windows.Data.Xml.Dom.XmlDocument
		$xml.LoadXml($template)
		$toast = New-Object Windows.UI.Notifications.ToastNotification $xml
		[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("ForgeFlow").Show($toast)
	`, title, message)

	cmd := exec.Command("powershell", "-WindowStyle", "Hidden", "-Command", script)
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	return cmd.Run()
}

func (as *ActionService) OpenURL(url string) error {
	cmd := exec.Command("cmd", "/c", "start", url)
	return cmd.Start()
}

func (as *ActionService) SetClipboard(content string) error {
	cmd := exec.Command("powershell", "-Command", fmt.Sprintf("Set-Clipboard -Value '%s'", content))
	return cmd.Run()
}

func (as *ActionService) GetClipboard() (string, error) {
	cmd := exec.Command("powershell", "-Command", "Get-Clipboard")
	output, err := cmd.Output()
	if err != nil {
		return "", err
	}
	return string(output), nil
}
