# BitBurner Monitoring and Automation Suite

This project contains a set of BitBurner scripts designed to turn the normal collection of hacking scripts into a more organized monitoring, analysis, and automation system.

The suite separates **targets**, **worker servers**, **monitoring**, **automation**, and **performance analysis** so that each part of the hacking network can be understood and managed independently.

## Main Scripts

### `bb-control.js`

Central control center for the entire suite.

Use this as the main starting point:

```text
run bb-control.js
```

Features:

- Launches all monitoring dashboards
- Detects monitors that are already running
- Opens existing tail windows instead of starting duplicate copies
- Starts, stops, restarts, and configures the dispatcher
- Supports dispatcher dry-run mode
- Shows BB suite status
- Shows running scripts across the network
- Provides access to older utility scripts
- Can stop the entire BB suite

The control center is intended to replace manually running each dashboard from the terminal.

---

### `bb-overview.js`

Primary high-level operations dashboard.

Provides a quick view of the current state of the hacking network, including:

- Player hacking level
- Player money
- Available port-opening programs
- Current script income
- Current hacking EXP rate
- Rooted and unrooted servers
- Rootable servers
- Available and used network RAM
- RAM utilization
- Running processes and threads
- Active hacking targets
- Target money/security condition
- Coding contract count
- Top target candidates
- Important alerts and opportunities

This is the best dashboard for getting a quick overall status of the game.

---

### `bb-targets.js`

Target profitability and HGW analysis dashboard.

Analyzes rooted money-producing servers and estimates how efficiently each one can be attacked.

Displays:

- Server name
- Target state
- Expected money per second
- Money efficiency per GB of RAM
- Hack success chance
- Target hack percentage
- Required hack threads
- Required grow threads
- Required weaken threads
- Estimated batch RAM
- Maximum money
- Security condition
- Hack time
- Approximate number of batches that can fit in available RAM
- Current target activity

This script is intended to answer:

> Which server should I be hacking?

It is an analyzer only and does not launch hacking jobs.

---

### `bb-workers.js`

Worker-server and RAM utilization monitor.

Treats rooted servers with available RAM as worker machines regardless of whether those machines contain money.

Displays:

- Total network RAM
- Used RAM
- Free RAM
- RAM utilization
- Worker host status
- Processes per host
- Threads per host
- Hack threads
- Grow threads
- Weaken threads
- Other script threads
- Targets being attacked from each worker
- Workload by target
- Idle worker servers
- Underused RAM

This dashboard helps identify servers that are available to contribute RAM to distributed hacking.

---

## Automation System

### `bb-dispatcher.js`

Central HWGW hacking controller.

The dispatcher pools RAM from rooted servers and uses that RAM to attack one selected target.

Instead of having every machine hack itself, the dispatcher treats rooted RAM as a shared worker pool.

Example:

```text
sigma-cosmetics RAM ─┐
joesguns RAM         ├──► phantasy
foodnstuff RAM       ┤
home RAM             ┘
```

The server running the worker script does not have to be the target.

The dispatcher performs the following cycle:

```text
Scan network
    ↓
Find rooted worker RAM
    ↓
Choose target
    ↓
Prepare security
    ↓
Prepare money
    ↓
Calculate HWGW batch
    ↓
Distribute workers across network
    ↓
Hack
Weaken
Grow
Weaken
    ↓
Repeat
```

The dispatcher first prepares the target so that:

```text
Money    = near maximum
Security = near minimum
```

It then launches coordinated HWGW batches.

Supported options include:

```text
--target phantasy
--hack 0.05
--reserve 8
--gap 100
--max-batches 25
--dry-run
```

Example:

```text
run bb-dispatcher.js --hack 0.05 --reserve 8 --gap 100 --max-batches 25
```

Dry-run mode:

```text
run bb-dispatcher.js --dry-run
```

Dry-run performs target analysis and allocation calculations without launching workers.

---

### `bb-hack-worker.js`

Lightweight hack worker.

Receives a target and optional timing delay from the dispatcher and executes:

```javascript
ns.hack(target)
```

The worker is intentionally small so that most analysis RAM cost remains inside the central dispatcher.

---

### `bb-grow-worker.js`

Lightweight grow worker.

Receives a target and timing value from the dispatcher and executes:

```javascript
ns.grow(target)
```

Used both during target preparation and HWGW batches.

---

### `bb-weaken-worker.js`

Lightweight weaken worker.

Receives a target and timing value from the dispatcher and executes:

```javascript
ns.weaken(target)
```

Used to:

- Prepare high-security targets
- Counter hack security increases
- Counter grow security increases

---

## Opportunity Monitoring

### `bb-opportunities.js`

Live progression and opportunity monitor.

Designed to answer:

> What just became available to me?

Tracks:

- Newly rootable servers
- Newly hackable servers
- Idle RAM servers
- Coding contracts
- Hacking-level increases
- New port-cracking programs
- Changes in the current best target
- Dispatcher activity
- Conflicts between dispatcher workers and older hacking scripts

It also provides notifications when important opportunities appear.

### Clickable Server Links

If `AutoLink.exe` is available, server names become clickable.

Clicking a server name connects through the required network path, similar to `scan-analyze`.

Clickable links are provided for:

- Rootable servers
- Best target
- Idle RAM hosts
- Dispatcher targets
- Conflict hosts
- Coding contract servers

---

## Performance Monitoring

### `bb-income.js`

Income and hacking-performance analyzer.

Designed to answer:

> Is the hacking system actually making more money?

Displays:

- Current total script income per second
- Current hacking EXP per second
- 1-minute average income
- 5-minute average income
- Recent completed-script income
- Recent EXP production
- RAM utilization
- Dispatcher activity
- Realized performance by target
- Realized performance by script
- Realized performance by worker host
- Lifetime averages for currently running scripts
- Income and RAM utilization warnings

The analyzer also uses recently completed scripts so that short-lived dispatcher workers are not lost from the performance analysis immediately after they finish.

Example output conceptually:

```text
CURRENT PERFORMANCE

Income / sec       $28.4m
EXP / sec          185.2k
Processes          74
Threads            1,483

INCOME TREND

Current            $28.4m/sec
1 Min Avg          $26.9m/sec
5 Min Avg          $23.1m/sec

▲ +23% vs 5-minute average
```

---

# Recommended Startup

The easiest way to use the suite is:

```text
run bb-control.js
```

From the control center, start or open:

```text
bb-overview.js
bb-targets.js
bb-workers.js
bb-opportunities.js
bb-income.js
bb-dispatcher.js
```

The control center detects scripts that are already running and opens their existing tail windows instead of starting duplicate copies.

---

# Suggested Workflow

A typical workflow is:

```text
bb-control.js
      ↓
bb-overview.js
      ↓
bb-opportunities.js
      ↓
bb-targets.js
      ↓
bb-workers.js
      ↓
bb-dispatcher.js
      ↓
bb-income.js
```

### 1. Overview

Check the overall network state.

### 2. Opportunities

Look for newly rootable servers, contracts, idle RAM, or conflicts.

### 3. Targets

Determine which money servers are worth attacking.

### 4. Workers

Verify that available RAM is being used efficiently.

### 5. Dispatcher

Automatically distribute HGW work across the network.

### 6. Income

Measure whether the automation is actually improving income.

---

# Target Servers vs Worker Servers

An important design idea in this suite is that a **target** and a **worker** are different things.

A target is a server with money:

```text
phantasy
omega-net
silver-helix
```

A worker is any rooted server with usable RAM:

```text
sigma-cosmetics
joesguns
home
pserv-0
```

A worker may attack a completely different server.

For example:

```text
sigma-cosmetics
    running bb-grow-worker.js
    target: phantasy
```

means:

> Use the RAM on `sigma-cosmetics` to grow the money on `phantasy`.

This allows the entire rooted network to contribute RAM toward the most profitable target.

---

# Existing Scripts

Older hacking scripts can continue running alongside the new monitoring suite.

However, care should be taken when an older hacking script attacks the same target being controlled by `bb-dispatcher.js`.

An older script may unexpectedly:

- Hack money before a scheduled batch lands
- Increase security
- Trigger an unexpected grow
- Change dispatcher calculations

`bb-opportunities.js` includes conflict detection to help identify this situation.

Monitoring scripts and unrelated utility scripts are generally safe to run alongside the dispatcher.

---

# Important BitBurner Settings

For best results with `bb-income.js`, consider increasing:

```text
Settings
→ Recently killed scripts size
```

The income analyzer uses recently completed scripts to evaluate short-lived dispatcher workers.

If many batches are running and this setting is very small, completed workers may disappear before the analyzer can include them.

---

# Current Suite

```text
bb-control.js
bb-overview.js
bb-targets.js
bb-workers.js
bb-opportunities.js
bb-income.js

bb-dispatcher.js
bb-hack-worker.js
bb-grow-worker.js
bb-weaken-worker.js
```

Together these scripts provide:

```text
Monitoring
    +
Target analysis
    +
Worker analysis
    +
Opportunity detection
    +
Distributed hacking
    +
Income measurement
    +
Central control
```

The overall goal is to turn the BitBurner network into a centralized, observable hacking system instead of a collection of independent scripts.
