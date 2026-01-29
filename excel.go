package main

import (
	"encoding/json"
	"fmt"

	"github.com/xuri/excelize/v2"
)

type ExcelService struct{}

func NewExcelService() *ExcelService {
	return &ExcelService{}
}

// WriteExcel writes data to an Excel file
func (es *ExcelService) WriteExcel(path string, dataJSON string, sheetName string, includeHeaders bool) error {
	// Parse JSON data
	var data []map[string]interface{}
	if err := json.Unmarshal([]byte(dataJSON), &data); err != nil {
		return fmt.Errorf("invalid JSON data: %w", err)
	}

	if len(data) == 0 {
		return fmt.Errorf("no data to write")
	}

	// Create new Excel file
	f := excelize.NewFile()
	defer f.Close()

	// Create or get sheet
	if sheetName == "" {
		sheetName = "Sheet1"
	}

	index, err := f.NewSheet(sheetName)
	if err != nil {
		return fmt.Errorf("failed to create sheet: %w", err)
	}
	f.SetActiveSheet(index)

	// Get headers from first row
	headers := make([]string, 0)
	for key := range data[0] {
		headers = append(headers, key)
	}

	row := 1

	// Write headers if requested
	if includeHeaders {
		for col, header := range headers {
			cell, _ := excelize.CoordinatesToCellName(col+1, row)
			f.SetCellValue(sheetName, cell, header)
		}
		row++
	}

	// Write data rows
	for _, record := range data {
		for col, header := range headers {
			cell, _ := excelize.CoordinatesToCellName(col+1, row)
			value := record[header]
			f.SetCellValue(sheetName, cell, value)
		}
		row++
	}

	// Auto-fit columns
	for col := range headers {
		colName, _ := excelize.ColumnNumberToName(col + 1)
		f.SetColWidth(sheetName, colName, colName, 15)
	}

	// Save file
	if err := f.SaveAs(path); err != nil {
		return fmt.Errorf("failed to save Excel file: %w", err)
	}

	return nil
}

// ReadExcel reads data from an Excel file
func (es *ExcelService) ReadExcel(path string, sheetName string) (string, error) {
	f, err := excelize.OpenFile(path)
	if err != nil {
		return "", fmt.Errorf("failed to open Excel file: %w", err)
	}
	defer f.Close()

	// Get sheet name if not provided
	if sheetName == "" {
		sheetName = f.GetSheetName(0)
	}

	// Read all rows
	rows, err := f.GetRows(sheetName)
	if err != nil {
		return "", fmt.Errorf("failed to read rows: %w", err)
	}

	if len(rows) == 0 {
		return "[]", nil
	}

	// First row as headers
	headers := rows[0]

	// Convert to array of objects
	var data []map[string]interface{}
	for i := 1; i < len(rows); i++ {
		row := rows[i]
		record := make(map[string]interface{})

		for j, header := range headers {
			if j < len(row) {
				record[header] = row[j]
			} else {
				record[header] = ""
			}
		}

		data = append(data, record)
	}

	// Convert to JSON
	jsonData, err := json.Marshal(data)
	if err != nil {
		return "", fmt.Errorf("failed to marshal data: %w", err)
	}

	return string(jsonData), nil
}
