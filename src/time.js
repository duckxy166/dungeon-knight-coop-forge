(function(){
    'use strict';

    var DEFAULT_STEP_MS=1000/60;

    function finite(value,fallback){value=Number(value);return isFinite(value)?value:fallback;}

    function createFixedStep(options){
        options=options||{};
        var stepMs=Math.max(1,finite(options.stepMs,DEFAULT_STEP_MS));
        var baseStepMs=Math.max(1,finite(options.baseStepMs,DEFAULT_STEP_MS));
        var maxCatchUpMs=Math.max(stepMs,finite(options.maxCatchUpMs,250));
        var maxSteps=Math.max(1,Math.ceil(maxCatchUpMs/stepMs));
        var lastNow=null,accumulatorMs=0,simulationTimeMs=0;

        function reset(now){
            lastNow=finite(now,typeof performance!=='undefined'&&performance.now?performance.now():0);
            accumulatorMs=0;
        }

        function clear(){accumulatorMs=0;}

        function advance(now,running,onStep){
            now=finite(now,lastNow===null?0:lastNow);
            if(lastNow===null)lastNow=now;
            var elapsedMs=now-lastNow;
            if(!isFinite(elapsedMs)||elapsedMs<0)elapsedMs=0;
            elapsedMs=Math.min(elapsedMs,maxCatchUpMs);
            lastNow=now;
            if(running)accumulatorMs+=elapsedMs;else accumulatorMs=0;
            var steps=0;
            while(accumulatorMs+1e-7>=stepMs&&steps<maxSteps){
                simulationTimeMs+=stepMs;
                if(onStep)onStep({
                    deltaMs:stepMs,
                    deltaSeconds:stepMs/1000,
                    scale:stepMs/baseStepMs,
                    nowMs:simulationTimeMs
                });
                accumulatorMs-=stepMs;
                steps++;
            }
            if(steps===maxSteps&&accumulatorMs>=stepMs)accumulatorMs%=stepMs;
            return{elapsedMs:elapsedMs,simulatedMs:steps*stepMs,steps:steps,alpha:stepMs?accumulatorMs/stepMs:0};
        }

        return{
            advance:advance,
            reset:reset,
            clear:clear,
            stepMs:stepMs,
            baseStepMs:baseStepMs,
            snapshot:function(){return{lastNow:lastNow,accumulatorMs:accumulatorMs,simulationTimeMs:simulationTimeMs};}
        };
    }

    window.DKTime={BASE_STEP_MS:DEFAULT_STEP_MS,createFixedStep:createFixedStep};
}());
