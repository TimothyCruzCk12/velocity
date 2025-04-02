import React, { useState, useEffect } from 'react';
import { Slider } from '../components/ui/slider';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Play, RefreshCw, Lightbulb, Rocket } from 'lucide-react';

const Velocity = () => {
  const [speed, setSpeed] = useState(10);
  const [angle, setAngle] = useState(0);
  const [time, setTime] = useState(5);
  const [isMoving, setIsMoving] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [data, setData] = useState([{ time: 0, x: 0, y: 0 }]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentParams, setCurrentParams] = useState({ speed, angle, time });
  const [hasReachedBoundary, setHasReachedBoundary] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');

  const velocityX = currentParams.speed * Math.cos(currentParams.angle * Math.PI / 180);
  const velocityY = currentParams.speed * Math.sin(currentParams.angle * Math.PI / 180);

  const boxWidth = 300;
  const boxHeight = 300;

  useEffect(() => {
    let interval;
    if (isMoving) {
      const startTime = Date.now();
      interval = setInterval(() => {
        const currentTime = Date.now();
        const newElapsedTime = (currentTime - startTime) / 1000;
        
        if (newElapsedTime >= currentParams.time) {
          setIsMoving(false);
          setElapsedTime(currentParams.time);
          clearInterval(interval);
        } else {
          setElapsedTime(newElapsedTime);
          setPosition((prevPosition) => {
            const newX = prevPosition.x + velocityX * 0.05;
            const newY = prevPosition.y - velocityY * 0.05;

            const boundedX = Math.max(Math.min(newX, boxWidth / 2), -boxWidth / 2);
            const boundedY = Math.max(Math.min(newY, boxHeight / 2), -boxHeight / 2);

            if (boundedX !== newX || boundedY !== newY) {
              setHasReachedBoundary(true);
              setIsMoving(false);
              clearInterval(interval);
            }

            return { x: boundedX, y: boundedY };
          });
        }
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isMoving, velocityX, velocityY, currentParams.time, boxWidth, boxHeight]);

  useEffect(() => {
    if (isMoving || elapsedTime > 0) {
      setData((prevData) => [
        ...prevData,
        {
          time: elapsedTime,
          x: position.x,
          y: -position.y
        }
      ]);
    }
  }, [position, isMoving, elapsedTime]);

  const handleStart = () => {
    setIsMoving(true);
    setElapsedTime(0);
    setCurrentParams({ speed, angle, time });
    setHasReachedBoundary(false);
    setData([{ time: 0, x: 0, y: 0 }]);
    setFeedback('');
    setUserAnswer('');
  };

  const handleReset = () => {
    setIsMoving(false);
    setPosition({ x: 0, y: 0 });
    setData([{ time: 0, x: 0, y: 0 }]);
    setElapsedTime(0);
    setHasReachedBoundary(false);
    setFeedback('');
    setUserAnswer('');
  };

  return (
    <div className="bg-gray-100 p-8 min-h-screen">
      <Card className="w-full max-w-2xl mx-auto shadow-md bg-white">
        <CardHeader className="bg-sky-100 text-sky-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold">2D Velocity Simulator</CardTitle>
            <Rocket size={40} className="text-sky-600" />
          </div>
          <CardDescription className="text-sky-700 text-lg">Explore Motion in Two Dimensions!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <Alert className="bg-blue-50 border-blue-100">
            <Lightbulb className="h-4 w-4 text-blue-400" />
            <AlertTitle className="text-blue-700">Understanding 2D Motion</AlertTitle>
            <AlertDescription className="text-blue-600">
              This simulator helps you visualize how speed and angle affect the motion of an object in two dimensions. Adjust the parameters and observe how they influence the object's trajectory and position over time. The simulation ends when the object reaches a boundary.
            </AlertDescription>
          </Alert>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sky-700">Speed (m/s): {speed}</label>
              <Slider
                value={[speed]}
                onValueChange={(value) => setSpeed(value[0])}
                min={1}
                max={20}
                step={1}
                disabled={isMoving}
                className={isMoving ? 'opacity-50' : ''}
              />
            </div>
            <div>
              <label className="block mb-2 text-sky-700">Angle (degrees): {angle}°</label>
              <Slider
                value={[angle]}
                onValueChange={(value) => setAngle(value[0])}
                min={0}
                max={359}
                step={1}
                disabled={isMoving}
                className={isMoving ? 'opacity-50' : ''}
              />
            </div>
            <div>
              <label className="block mb-2 text-sky-700">Time (seconds): {time}s</label>
              <Slider
                value={[time]}
                onValueChange={(value) => setTime(value[0])}
                min={1}
                max={10}
                step={0.5}
                disabled={isMoving}
                className={isMoving ? 'opacity-50' : ''}
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={handleStart} 
                disabled={isMoving}
                className="flex-1 bg-emerald-400 hover:bg-emerald-500 text-white text-xl py-6"
              >
                <Play className="mr-2" /> Start Simulation
              </Button>
              <Button 
                onClick={handleReset} 
                variant="outline"
                className="flex-1 border-sky-300 text-sky-700 hover:bg-sky-50 text-xl py-6"
              >
                <RefreshCw className="mr-2" /> Reset
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start bg-gray-50 pt-8">
          <div className="w-full space-y-6">
            <div className="h-80 w-full bg-white p-4 rounded-lg shadow">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    label={{ value: 'Time (s)', position: 'bottom', offset: 20 }}
                    domain={[0, 'dataMax']}
                  />
                  <YAxis 
                    label={{ 
                      value: 'Position (m)', 
                      angle: -90, 
                      position: 'insideLeft', 
                      offset: 0,
                      style: { textAnchor: 'middle' }
                    }}
                  />
                  <Tooltip />
                  <Line type="monotone" dataKey="x" stroke="#8884d8" name="X Position" />
                  <Line type="monotone" dataKey="y" stroke="#82ca9d" name="Y Position" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-sky-700 mb-2">Simulation Results:</h3>
              <p>Initial Speed: {currentParams.speed.toFixed(2)} m/s at {currentParams.angle}°</p>
              <p>Initial Velocity X: {velocityX.toFixed(2)} m/s</p>
              <p>Initial Velocity Y: {velocityY.toFixed(2)} m/s</p>
              <p>Final Position: ({position.x.toFixed(2)}, {-position.y.toFixed(2)})</p>
              <p>Time Elapsed: {elapsedTime.toFixed(2)}s</p>
              {hasReachedBoundary && (
                <p className="text-red-500 font-semibold mt-2">Object reached the boundary!</p>
              )}
              {!isMoving && elapsedTime > 0 && (
                <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="text-blue-800 font-semibold mb-2">Calculate the Final Velocity:</h4>
                  <div className="text-blue-900">
                    <p className="mb-1">Given:</p>
                    <ul className="list-disc ml-5 mb-3">
                      <li>Total Distance = {Math.sqrt(Math.pow(position.x, 2) + Math.pow(position.y, 2)).toFixed(2)} m</li>
                      <li>Total Time = {elapsedTime.toFixed(2)} s</li>
                      <li>Formula: v = d/t</li>
                    </ul>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Enter Velocity"
                      className="border border-blue-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                    <button
                      onClick={() => {
                        const distance = Math.sqrt(Math.pow(position.x, 2) + Math.pow(position.y, 2));
                        const correctVelocity = distance / elapsedTime;
                        const isCorrect = Math.abs(parseFloat(userAnswer) - correctVelocity) < correctVelocity * 0.01;
                        
                        setFeedback(isCorrect ? 
                          `🎉 Correct! The final velocity is ${correctVelocity.toFixed(2)} m/s` : 
                          'Try again! Remember: velocity = distance ÷ time');
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Check Answer
                    </button>
                  </div>
                  {feedback && (
                    <p className={`mt-2 font-semibold ${feedback.includes('Correct') ? 'text-green-600' : 'text-red-600'}`}>
                      {feedback}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Velocity;