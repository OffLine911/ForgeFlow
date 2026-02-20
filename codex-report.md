[High] Zip Slip vulnerability in archive extraction
actions.go (line 243) joins dest with f.Name directly and writes files without path validation. A crafted zip entry like ..\..\AppData\... can overwrite arbitrary files outside extraction directory.

[High] Engine can recurse forever / execute nodes repeatedly on cyclic or converging graphs
engine.go (line 157) and engine.go (line 187) recursively execute downstream nodes with no visited/cycle guard and no “all predecessors completed” gating.
Impact: stack overflow on cycles, duplicate execution on DAG joins.

[High] Frontend executor has the same graph-execution flaw
WorkflowExecutor.ts (line 387) recursively traverses edges without cycle detection or join coordination.
Impact: infinite recursion, repeated node runs, nondeterministic outputs in non-trivial graphs.

[High] Stop flow does not actually stop backend execution
flowStore.ts (line 492) creates a client UUID, but backend RunFlow creates its own exec ID (engine.go (line 97)).
flowStore.ts (line 593) calls backend run only after local executor finishes; then StopExecution at flowStore.ts (line 641) uses the wrong ID and is effectively a no-op.

[Medium] Aborted runs can be reported as success
WorkflowExecutor.ts (line 75) always logs completion when no exception is thrown, even after abort().
flowStore.ts (line 568) defaults final status to "success" and only flips on thrown error, so user-stopped executions can be saved as success (flowStore.ts (line 607)).

[Medium] Path traversal risk for flow/secrets file access
storage.go (line 79), storage.go (line 146), storage.go (line 303), storage.go (line 309) use unvalidated flowID/key in filepath.Join(...). Inputs containing path separators can escape intended directories.

[Medium] Storage init errors are ignored across methods
storage.go (line 45), storage.go (line 77), storage.go (line 145), etc. call s.Init() and discard its error. If init fails, operations proceed with invalid/empty dataDir, causing writes/reads in unintended locations and silent failures.

[Medium] Unsafe dynamic code execution (eval / new Function)
conditions.ts (line 21), WorkflowExecutor.ts (line 195), and custom.ts (line 36) execute dynamic JS. In workflows imported/shared from untrusted sources, this is code-injection risk.

[Low] Compression ignores walk errors
actions.go (line 194) calls filepath.Walk(...) but does not check its returned error. Compression can silently succeed with incomplete/corrupt archives.

[Low] Webhook trigger server is unauthenticated and bound to all interfaces
triggers.go (line 381) binds (line 8080), and handler at triggers.go (line 347) executes flows without auth/signature checks. Exposes local automation trigger surface to network peers.

Build/check results

go build ./...: passes
npm run --prefix frontend build: passes, but warns about eval usage and large chunk size
Residual risk / test gaps

No automated tests for graph semantics (cycles, merges, stop/cancel behavior, execution status correctness, secure archive extraction, path sanitization). These are the biggest missing protections.