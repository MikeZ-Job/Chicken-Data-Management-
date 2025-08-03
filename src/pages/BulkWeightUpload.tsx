import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Layout } from "@/components/Layout";
import { Upload, Download, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useFarm } from "@/contexts/FarmContext";

interface UploadResult {
  success: number;
  errors: string[];
  totalRows: number;
}

const BulkWeightUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { selectedFarm } = useFarm();

  const downloadTemplate = () => {
    const csvContent = "chicken_id,date_recorded,weight_kg\n33,2025-08-03,2.5\n34,2025-08-03,2.8";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'weight_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV file",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const parseCSV = (text: string): Array<{ chicken_id: string; date_recorded: string; weight_kg: string; _lineNumber: number }> => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Validate headers
    const expectedHeaders = ['chicken_id', 'date_recorded', 'weight_kg'];
    if (!expectedHeaders.every(header => headers.includes(header))) {
      throw new Error(`Invalid CSV format. Expected headers: ${expectedHeaders.join(', ')}`);
    }

    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      row._lineNumber = index + 2; // +2 because we start from line 2 (after header)
      return row;
    });
  };

  const validateRow = (row: any, lineNumber: number): string | null => {
    if (!row.chicken_id || isNaN(parseInt(row.chicken_id))) {
      return `Line ${lineNumber}: Invalid chicken_id`;
    }
    if (!row.date_recorded || isNaN(Date.parse(row.date_recorded))) {
      return `Line ${lineNumber}: Invalid date_recorded format (use YYYY-MM-DD)`;
    }
    if (!row.weight_kg || isNaN(parseFloat(row.weight_kg)) || parseFloat(row.weight_kg) <= 0) {
      return `Line ${lineNumber}: Invalid weight_kg (must be a positive number)`;
    }
    return null;
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      
      const errors: string[] = [];
      const validRows: Array<{ chicken_id: number; date_recorded: string; weight_kg: number }> = [];

      // Validate each row
      for (const row of rows) {
        const error = validateRow(row, row._lineNumber);
        if (error) {
          errors.push(error);
        } else {
          // Check if chicken exists
          const { data: chicken, error: chickenError } = await supabase
            .from('chicken_inventory')
            .select('id')
            .eq('id', parseInt(row.chicken_id))
            .single();

          if (chickenError || !chicken) {
            errors.push(`Line ${row._lineNumber}: Chicken ID ${row.chicken_id} not found`);
          } else {
            validRows.push({
              chicken_id: parseInt(row.chicken_id),
              date_recorded: row.date_recorded,
              weight_kg: parseFloat(row.weight_kg)
            });
          }
        }
      }

      // Insert valid rows
      let successCount = 0;
      if (validRows.length > 0) {
        const { data, error } = await supabase
          .from('chicken_weights')
          .insert(validRows)
          .select();

        if (error) {
          // Handle duplicate entries or other database errors
          if (error.code === '23505') { // Unique constraint violation
            errors.push("Some weight records already exist for the specified chicken and date combinations");
          } else {
            errors.push(`Database error: ${error.message}`);
          }
        } else {
          successCount = data?.length || 0;
        }
      }

      setUploadResult({
        success: successCount,
        errors,
        totalRows: rows.length
      });

      if (successCount > 0) {
        toast({
          title: "Upload completed",
          description: `Successfully uploaded ${successCount} weight records`,
        });
      }

    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Layout showBackButton={true}>
      <div className="p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Bulk Weight Upload</h1>
            <p className="text-muted-foreground">
              Upload chicken weights from a CSV file
            </p>
          </div>

          <div className="grid gap-6">
            {/* Template Download */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Download Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Download the CSV template with the correct format and sample data.
                </p>
                <Button onClick={downloadTemplate} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV Template
                </Button>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Weights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="csv-file">Select CSV File</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="mt-1"
                  />
                </div>

                <Alert>
                  <AlertDescription>
                    CSV Format: chicken_id, date_recorded (YYYY-MM-DD), weight_kg
                  </AlertDescription>
                </Alert>

                <div className="flex gap-4">
                  <Button 
                    onClick={handleUpload} 
                    disabled={!file || isUploading}
                    className="flex-1"
                  >
                    {isUploading ? (
                      "Uploading..."
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Weights
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upload Results */}
            {uploadResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {uploadResult.success > 0 ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    Upload Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{uploadResult.success}</div>
                      <div className="text-sm text-muted-foreground">Successful</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{uploadResult.errors.length}</div>
                      <div className="text-sm text-muted-foreground">Errors</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{uploadResult.totalRows}</div>
                      <div className="text-sm text-muted-foreground">Total Rows</div>
                    </div>
                  </div>

                  {uploadResult.errors.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2">Errors:</h4>
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {uploadResult.errors.map((error, index) => (
                          <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            {error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BulkWeightUpload;