package main

import (
	"context"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) shutdown(ctx context.Context) {
}

func (a *App) GetAppInfo() map[string]string {
	return map[string]string{
		"name":    "ForgeFlow",
		"version": "0.2.7",
		"tagline": "Local automation. Zero cloud. Full control.",
	}
}

func (a *App) GetDataDir() (string, error) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	dataDir := filepath.Join(configDir, "ForgeFlow")
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		return "", err
	}
	return dataDir, nil
}

func (a *App) SelectFile(title string, filters []runtime.FileFilter) (string, error) {
	return runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title:   title,
		Filters: filters,
	})
}

func (a *App) SelectDirectory(title string) (string, error) {
	return runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: title,
	})
}

func (a *App) ShowMessage(title, message string) {
	runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
		Type:    runtime.InfoDialog,
		Title:   title,
		Message: message,
	})
}

func (a *App) ShowError(title, message string) {
	runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
		Type:    runtime.ErrorDialog,
		Title:   title,
		Message: message,
	})
}

func (a *App) Confirm(title, message string) (bool, error) {
	result, err := runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
		Type:          runtime.QuestionDialog,
		Title:         title,
		Message:       message,
		Buttons:       []string{"Yes", "No"},
		DefaultButton: "Yes",
		CancelButton:  "No",
	})
	return result == "Yes", err
}
