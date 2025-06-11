import React, { useState, useEffect } from 'react';
import { Button, Input, Card, Badge, Alert } from '../UI';
import { Loader2, Zap, Lock, Gift, TrendingUp, BarChart3, Radar, Sparkles } from 'lucide-react';
import { oulipoService, OulipoConstraint, ConstraintResult, CLASSICAL_CONSTRAINTS, EXTENDED_CONSTRAINTS } from '../../services/oulipo';
import * as d3 from 'd3';

interface OulipoAssistantProps {
  onTextChange?: (text: string) => void;
}

interface VisualizationData {
  constraint: string;
  violations: number;
  successRate: number;
  difficulty: number;
  usage: number;
}

const OulipoAssistant: React.FC<OulipoAssistantProps> = ({ onTextChange }) => {
  const [selectedConstraint, setSelectedConstraint] = useState<OulipoConstraint | null>(null);
  const [inputText, setInputText] = useState('');
  const [constraintParams, setConstraintParams] = useState<Record<string, any>>({});
  const [result, setResult] = useState<ConstraintResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userStatus, setUserStatus] = useState({ credits: 0, remainingFreeQueries: 3 });
  const [visualizationData, setVisualizationData] = useState<VisualizationData[]>([]);

  useEffect(() => {
    initializeService();
  }, []);

  const initializeService = async () => {
    await oulipoService.initialize();
    setUserStatus(oulipoService.getStatus());
    generateVisualizationData();
  };

  const generateVisualizationData = () => {
    const data: VisualizationData[] = [...CLASSICAL_CONSTRAINTS, ...EXTENDED_CONSTRAINTS].map(constraint => ({
      constraint: constraint.name,
      violations: Math.floor(Math.random() * 20),
      successRate: Math.random() * 100,
      difficulty: constraint.difficulty === 'beginner' ? 1 : constraint.difficulty === 'intermediate' ? 2 : 3,
      usage: Math.floor(Math.random() * 50)
    }));
    setVisualizationData(data);
  };

  const handleConstraintSelect = (constraint: OulipoConstraint) => {
    setSelectedConstraint(constraint);
    setResult(null);
    setConstraintParams({});
  };

  const handleProcess = async () => {
    if (!selectedConstraint || !inputText.trim()) return;

    setIsProcessing(true);
    try {
      let constraintResult: ConstraintResult;

      switch (selectedConstraint.id) {
        case 'lipogram':
          constraintResult = await oulipoService.performLipogram(
            inputText,
            constraintParams.forbiddenLetter || 'e'
          );
          break;
        case 'n_plus_7':
          constraintResult = await oulipoService.performNPlus7(
            inputText,
            constraintParams.offset || 7
          );
          break;
        case 'palindrome':
          constraintResult = await oulipoService.performPalindrome(inputText);
          break;
        case 'snowball':
          constraintResult = await oulipoService.performSnowball(inputText);
          break;
        case 'haiku_generator':
          constraintResult = await oulipoService.generateHaiku(constraintParams.theme);
          break;
        default:
          constraintResult = { success: false, violations: [{ position: 0, length: 0, issue: 'Constraint not implemented yet' }] };
      }

      setResult(constraintResult);
      setUserStatus(oulipoService.getStatus());
      
      if (constraintResult.result && onTextChange) {
        onTextChange(constraintResult.result);
      }
    } catch (error) {
      console.error('Constraint processing failed:', error);
      setResult({ success: false, violations: [{ position: 0, length: 0, issue: 'Processing failed' }] });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderConstraintCard = (constraint: OulipoConstraint) => {
    const canPerform = oulipoService.canPerformConstraint(constraint.id);
    
    return (
      <Card 
        key={constraint.id}
        className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
          selectedConstraint?.id === constraint.id 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
        }`}
        onClick={() => handleConstraintSelect(constraint)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              {constraint.name}
              <Badge variant={constraint.difficulty === 'beginner' ? 'default' : 
                             constraint.difficulty === 'intermediate' ? 'secondary' : 'destructive'}>
                {constraint.difficulty}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-1">
              {canPerform.canPerform ? (
                userStatus.remainingFreeQueries > 0 ? (
                  <Badge variant="outline" className="text-green-600">
                    <Gift className="w-3 h-3 mr-1" />
                    Free
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-blue-600">
                    <Zap className="w-3 h-3 mr-1" />
                    {constraint.creditCost}
                  </Badge>
                )
              ) : (
                <Badge variant="destructive">
                  <Lock className="w-3 h-3 mr-1" />
                  Locked
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-300">{constraint.description}</p>
        </CardContent>
      </Card>
    );
  };

  const renderConstraintParameters = () => {
    if (!selectedConstraint) return null;

    switch (selectedConstraint.id) {
      case 'lipogram':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="forbidden-letter">Forbidden Letter</Label>
              <Input
                id="forbidden-letter"
                value={constraintParams.forbiddenLetter || 'e'}
                onChange={(e) => setConstraintParams(prev => ({ ...prev, forbiddenLetter: e.target.value.toLowerCase() }))}
                maxLength={1}
                placeholder="e"
                className="w-20"
              />
            </div>
          </div>
        );
      case 'n_plus_7':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="offset">Dictionary Offset</Label>
              <Input
                id="offset"
                type="number"
                value={constraintParams.offset || 7}
                onChange={(e) => setConstraintParams(prev => ({ ...prev, offset: parseInt(e.target.value) }))}
                min={1}
                max={20}
                className="w-20"
              />
            </div>
          </div>
        );
      case 'haiku_generator':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="theme">Theme (optional)</Label>
              <Input
                id="theme"
                value={constraintParams.theme || ''}
                onChange={(e) => setConstraintParams(prev => ({ ...prev, theme: e.target.value }))}
                placeholder="nature, love, seasons..."
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderVisualization = (type: string) => {
    const svgRef = React.useRef<SVGSVGElement>(null);

    React.useEffect(() => {
      if (!svgRef.current || !visualizationData.length) return;

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const margin = { top: 20, right: 30, bottom: 40, left: 40 };
      const width = 400 - margin.left - margin.right;
      const height = 300 - margin.top - margin.bottom;

      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      switch (type) {
        case 'heatmap':
          // Simple heatmap for constraint difficulty vs usage
          const xScale = d3.scaleBand()
            .domain(visualizationData.map(d => d.constraint))
            .range([0, width])
            .padding(0.1);

          const yScale = d3.scaleLinear()
            .domain([0, 3])
            .range([height, 0]);

          const colorScale = d3.scaleSequential(d3.interpolateReds)
            .domain([0, d3.max(visualizationData, d => d.usage) || 50]);

          g.selectAll(".heatmap-rect")
            .data(visualizationData)
            .enter().append("rect")
            .attr("class", "heatmap-rect")
            .attr("x", d => xScale(d.constraint) || 0)
            .attr("y", d => yScale(d.difficulty))
            .attr("width", xScale.bandwidth())
            .attr("height", height / 3)
            .attr("fill", d => colorScale(d.usage))
            .attr("stroke", "#fff");
          break;

        case 'bar':
          // Bar chart for success rates
          const xBarScale = d3.scaleBand()
            .domain(visualizationData.map(d => d.constraint))
            .range([0, width])
            .padding(0.1);

          const yBarScale = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);

          g.selectAll(".bar")
            .data(visualizationData)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => xBarScale(d.constraint) || 0)
            .attr("y", d => yBarScale(d.successRate))
            .attr("width", xBarScale.bandwidth())
            .attr("height", d => height - yBarScale(d.successRate))
            .attr("fill", "steelblue");
          break;
      }
    }, [visualizationData, type]);

    return <svg ref={svgRef} width={400} height={300} className="border rounded" />;
  };

  return (
    <div className="h-full flex flex-col space-y-6 p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-950 dark:via-blue-950 dark:to-cyan-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Oulipo Experimental Writing
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Constraint-based writing techniques from the Ouvroir de Littérature Potentielle
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="font-semibold">{userStatus.credits} Credits</span>
            </div>
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-green-500" />
              <span className="text-sm">{userStatus.remainingFreeQueries} Free Today</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Constraint Selection */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="classical" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="classical">Classical Oulipo</TabsTrigger>
              <TabsTrigger value="extended">Extended Techniques</TabsTrigger>
            </TabsList>
            
            <TabsContent value="classical" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CLASSICAL_CONSTRAINTS.map(renderConstraintCard)}
              </div>
            </TabsContent>
            
            <TabsContent value="extended" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {EXTENDED_CONSTRAINTS.map(renderConstraintCard)}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Processing Panel */}
        <div className="space-y-6">
          {selectedConstraint && (
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {selectedConstraint.name}
                  <Badge variant="outline">{selectedConstraint.category}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderConstraintParameters()}
                
                <div>
                  <Label htmlFor="input-text">Input Text</Label>
                  <Textarea
                    id="input-text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={selectedConstraint.id === 'haiku_generator' 
                      ? 'Leave empty to generate a new haiku' 
                      : 'Enter your text to analyze or transform...'}
                    rows={6}
                    className="mt-2"
                  />
                </div>

                <Button 
                  onClick={handleProcess}
                  disabled={isProcessing || (!inputText.trim() && selectedConstraint.id !== 'haiku_generator')}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Apply Constraint
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {result && (
            <Card className={`bg-white dark:bg-gray-800 shadow-lg border-l-4 ${
              result.success ? 'border-l-green-500' : 'border-l-red-500'
            }`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${
                  result.success ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.success ? 'Success!' : 'Needs Work'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.result && (
                  <div>
                    <Label>Result</Label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded border">
                      {result.result}
                    </div>
                  </div>
                )}

                {result.violations && result.violations.length > 0 && (
                  <div>
                    <Label>Issues Found</Label>
                    <div className="space-y-2">
                      {result.violations.map((violation, index) => (
                        <Alert key={index} variant="destructive">
                          <AlertDescription>
                            {violation.issue}
                            {violation.suggestion && ` - ${violation.suggestion}`}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}

                {result.suggestions && result.suggestions.length > 0 && (
                  <div>
                    <Label>Suggestions</Label>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      {result.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.metadata && (
                  <div>
                    <Label>Metadata</Label>
                    <pre className="text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded overflow-auto">
                      {JSON.stringify(result.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Visualizations */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Constraint Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="heatmap" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="heatmap">
                    <Radar className="w-4 h-4 mr-1" />
                    Usage
                  </TabsTrigger>
                  <TabsTrigger value="bar">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Success
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="heatmap">
                  {renderVisualization('heatmap')}
                </TabsContent>
                
                <TabsContent value="bar">
                  {renderVisualization('bar')}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OulipoAssistant;
