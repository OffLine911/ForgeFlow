export namespace frontend {
	
	export class FileFilter {
	    DisplayName: string;
	    Pattern: string;
	
	    static createFrom(source: any = {}) {
	        return new FileFilter(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.DisplayName = source["DisplayName"];
	        this.Pattern = source["Pattern"];
	    }
	}

}

export namespace main {
	
	export class ExecutionResult {
	    nodeId: string;
	    status: string;
	    output?: any;
	    error?: string;
	    duration: number;
	    timestamp: string;
	
	    static createFrom(source: any = {}) {
	        return new ExecutionResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.nodeId = source["nodeId"];
	        this.status = source["status"];
	        this.output = source["output"];
	        this.error = source["error"];
	        this.duration = source["duration"];
	        this.timestamp = source["timestamp"];
	    }
	}
	export class FlowExecution {
	    id: string;
	    flowId: string;
	    status: string;
	    results: ExecutionResult[];
	    startedAt: string;
	    endedAt?: string;
	
	    static createFrom(source: any = {}) {
	        return new FlowExecution(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.flowId = source["flowId"];
	        this.status = source["status"];
	        this.results = this.convertValues(source["results"], ExecutionResult);
	        this.startedAt = source["startedAt"];
	        this.endedAt = source["endedAt"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

