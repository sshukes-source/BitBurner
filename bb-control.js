/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");

    // ============================================================
    // BITBURNER CONTROL CENTER
    // ============================================================
    //
    // Central launcher for:
    //
    //   bb-overview.js
    //   bb-targets.js
    //   bb-workers.js
    //   bb-opportunities.js
    //   bb-income.js
    //   bb-dispatcher.js
    //
    // Plus existing utility scripts.
    //
    // Features:
    //
    //   - Detects already-running monitors
    //   - Opens existing tail instead of duplicating scripts
    //   - Dispatcher start/configuration menu
    //   - Dispatcher stop/restart
    //   - Suite process/status viewer
    //   - Stop all bb-* scripts
    //   - Legacy utility launcher
    //
    // ============================================================


    // ============================================================
    // CONFIGURATION
    // ============================================================

    const CONFIG = {

        home:
            "home",

        // Scripts considered part of the BB control suite.
        suiteScripts: [
            "bb-control.js",
            "bb-overview.js",
            "bb-targets.js",
            "bb-workers.js",
            "bb-opportunities.js",
            "bb-income.js",
            "bb-dispatcher.js",
            "bb-hack-worker.js",
            "bb-grow-worker.js",
            "bb-weaken-worker.js"
        ]
    };


    // ============================================================
    // MONITOR DEFINITIONS
    // ============================================================

    const MONITORS = [

        {
            label:
                "Operations Overview",

            icon:
                "📊",

            script:
                "bb-overview.js",

            description:
                "Overall player, network, target and RAM status"
        },

        {
            label:
                "Target Analyzer",

            icon:
                "🎯",

            script:
                "bb-targets.js",

            description:
                "Target profitability and HGW efficiency"
        },

        {
            label:
                "Worker Monitor",

            icon:
                "🖥",

            script:
                "bb-workers.js",

            description:
                "RAM, workers, threads and target distribution"
        },

        {
            label:
                "Opportunity Monitor",

            icon:
                "🔔",

            script:
                "bb-opportunities.js",

            description:
                "Rooting, hacking, contracts and conflicts"
        },

        {
            label:
                "Income Analyzer",

            icon:
                "💵",

            script:
                "bb-income.js",

            description:
                "Actual income, trends and target performance"
        }
    ];


    // ============================================================
    // LEGACY / UTILITY SCRIPTS
    // ============================================================

    const UTILITIES = [

        {
            label:
                "Server Dashboard",

            icon:
                "🌐",

            scripts: [
                "dashboard.js"
            ]
        },

        {
            label:
                "Server Scanner",

            icon:
                "🔎",

            scripts: [
                "scanAllServers.js"
            ]
        },

        {
            label:
                "Zero-RAM Targets",

            icon:
                "💰",

            scripts: [
                "zeroRamTargets.js"
            ]
        },

        {
            label:
                "Coding Contracts",

            icon:
                "📜",

            scripts: [
                "find-contracts.js",
                "contracts.js"
            ]
        },

        {
            label:
                "Admin / Rooted Servers",

            icon:
                "🔓",

            scripts: [
                "scanAdminServers.js"
            ]
        },

        {
            label:
                "Running Servers",

            icon:
                "⚙",

            scripts: [
                "scanRunningServers.js"
            ]
        }
    ];


    // ============================================================
    // MAIN LOOP
    // ============================================================

    while (true) {

        const network =
            scanNetwork(ns);


        const menu =
            buildMainMenu(
                ns,
                MONITORS,
                UTILITIES,
                network
            );


        const choice =
            await ns.prompt(
                buildMainTitle(
                    ns,
                    network
                ),
                {
                    type:
                        "select",

                    choices:
                        menu.map(
                            item =>
                                item.display
                        )
                }
            );


        if (!choice) {
            return;
        }


        const selected =
            menu.find(
                item =>
                    item.display ===
                    choice
            );


        if (!selected) {
            continue;
        }


        // ========================================================
        // MONITOR
        // ========================================================

        if (
            selected.type ===
            "monitor"
        ) {

            await openOrLaunchMonitor(
                ns,
                selected.monitor,
                network
            );

            continue;
        }


        // ========================================================
        // DISPATCHER
        // ========================================================

        if (
            selected.action ===
            "dispatcher"
        ) {

            await dispatcherMenu(
                ns,
                network
            );

            continue;
        }


        // ========================================================
        // OPEN ALL MONITORS
        // ========================================================

        if (
            selected.action ===
            "open-all"
        ) {

            await openAllMonitors(
                ns,
                MONITORS,
                network
            );

            continue;
        }


        // ========================================================
        // SUITE STATUS
        // ========================================================

        if (
            selected.action ===
            "suite-status"
        ) {

            await showSuiteStatus(
                ns,
                CONFIG,
                network
            );

            continue;
        }


        // ========================================================
        // ALL RUNNING SCRIPTS
        // ========================================================

        if (
            selected.action ===
            "all-processes"
        ) {

            await showAllProcesses(
                ns,
                network
            );

            continue;
        }


        // ========================================================
        // UTILITY SCRIPT
        // ========================================================

        if (
            selected.type ===
            "utility"
        ) {

            await launchUtility(
                ns,
                selected.utility,
                network
            );

            continue;
        }


        // ========================================================
        // STOP SUITE
        // ========================================================

        if (
            selected.action ===
            "stop-suite"
        ) {

            await stopSuite(
                ns,
                CONFIG,
                network
            );

            continue;
        }


        // ========================================================
        // EXIT
        // ========================================================

        if (
            selected.action ===
            "exit"
        ) {

            return;
        }
    }
}


// =================================================================
// BUILD MAIN MENU
// =================================================================

function buildMainMenu(
    ns,
    monitors,
    utilities,
    network
) {

    const menu = [];


    // =============================================================
    // MONITORS
    // =============================================================

    for (
        const monitor
        of monitors
    ) {

        const running =
            findProcessesByScript(
                ns,
                network,
                monitor.script
            );


        const available =
            ns.fileExists(
                monitor.script,
                "home"
            );


        let status;


        if (!available) {

            status =
                "MISSING";
        }
        else if (
            running.length > 0
        ) {

            status =
                "RUNNING";
        }
        else {

            status =
                "READY";
        }


        menu.push({

            type:
                "monitor",

            monitor,

            display:
                `${monitor.icon} ${monitor.label}` +
                `  [${status}]`
        });
    }


    // =============================================================
    // AUTOMATION
    // =============================================================

    const dispatcher =
        findProcessesByScript(
            ns,
            network,
            "bb-dispatcher.js"
        );


    menu.push({

        action:
            "dispatcher",

        display:
            `⚔  Dispatcher Control  [` +
            (
                dispatcher.length > 0
                    ? "RUNNING"
                    : "STOPPED"
            ) +
            `]`
    });


    menu.push({

        action:
            "open-all",

        display:
            "🪟 Open / Start All Monitors"
    });


    // =============================================================
    // STATUS
    // =============================================================

    menu.push({

        action:
            "suite-status",

        display:
            "📋 BB Suite Status"
    });


    menu.push({

        action:
            "all-processes",

        display:
            "⚙  All Running Scripts"
    });


    // =============================================================
    // UTILITIES
    // =============================================================

    for (
        const utility
        of utilities
    ) {

        const script =
            findExistingUtilityScript(
                ns,
                utility
            );


        let status =
            "MISSING";


        if (script) {

            const running =
                findProcessesByScript(
                    ns,
                    network,
                    script
                );


            status =
                running.length > 0
                    ? "RUNNING"
                    : "READY";
        }


        menu.push({

            type:
                "utility",

            utility,

            display:
                `${utility.icon} ${utility.label}` +
                `  [${status}]`
        });
    }


    // =============================================================
    // SYSTEM
    // =============================================================

    menu.push({

        action:
            "stop-suite",

        display:
            "🛑 Stop BB Suite"
    });


    menu.push({

        action:
            "exit",

        display:
            "❌ Exit Control Center"
    });


    return menu;
}


// =================================================================
// MAIN TITLE
// =================================================================

function buildMainTitle(
    ns,
    network
) {

    const hackLevel =
        ns.getHackingLevel();


    const money =
        ns.getServerMoneyAvailable(
            "home"
        );


    const income =
        ns.getTotalScriptIncome()[0];


    let totalRam = 0;

    let usedRam = 0;


    for (
        const server
        of network
    ) {

        if (
            !ns.hasRootAccess(
                server
            )
        ) {

            continue;
        }


        totalRam +=
            ns.getServerMaxRam(
                server
            );


        usedRam +=
            ns.getServerUsedRam(
                server
            );
    }


    const ramPercent =
        totalRam > 0
            ? (
                usedRam /
                totalRam
            ) * 100
            : 0;


    return (

        "BITBURNER CONTROL CENTER\n\n" +

        `Hack Level: ${hackLevel}\n` +

        `Money: $${ns.format.number(
            money,
            2
        )}\n` +

        `Income: $${ns.format.number(
            income,
            2
        )}/sec\n` +

        `Network RAM: ${ramPercent.toFixed(1)}% used`
    );
}


// =================================================================
// OPEN OR LAUNCH MONITOR
// =================================================================

async function openOrLaunchMonitor(
    ns,
    monitor,
    network
) {

    if (
        !ns.fileExists(
            monitor.script,
            "home"
        )
    ) {

        await ns.alert(

            `${monitor.label}\n\n` +

            `Script not found:\n` +

            `${monitor.script}`
        );


        return;
    }


    const running =
        findProcessesByScript(
            ns,
            network,
            monitor.script
        );


    // -------------------------------------------------------------
    // ALREADY RUNNING
    // -------------------------------------------------------------

    if (
        running.length > 0
    ) {

        const process =
            running[0];


        try {

            ns.ui.openTail(
                process.pid
            );


            ns.toast(
                `Opened ${monitor.label}`,
                "info",
                2500
            );

        }
        catch {

            await ns.alert(

                `${monitor.label} is already running.\n\n` +

                `Host: ${process.host}\n` +

                `PID: ${process.pid}`
            );
        }


        return;
    }


    // -------------------------------------------------------------
    // START MONITOR
    // -------------------------------------------------------------

    const pid =
        ns.run(
            monitor.script,
            1
        );


    if (
        pid === 0
    ) {

        await showRamFailure(
            ns,
            monitor.script
        );


        return;
    }


    ns.toast(
        `Started ${monitor.label}`,
        "success",
        2500
    );


    // Give script a moment to initialize its tail.

    await ns.sleep(
        100
    );


    try {

        ns.ui.openTail(
            pid
        );

    }
    catch {

        // Script normally opens its own tail anyway.
    }
}


// =================================================================
// OPEN ALL MONITORS
// =================================================================

async function openAllMonitors(
    ns,
    monitors,
    network
) {

    let started = 0;

    let opened = 0;

    let missing = 0;

    let failed = 0;


    for (
        const monitor
        of monitors
    ) {

        if (
            !ns.fileExists(
                monitor.script,
                "home"
            )
        ) {

            missing++;

            continue;
        }


        const running =
            findProcessesByScript(
                ns,
                network,
                monitor.script
            );


        if (
            running.length > 0
        ) {

            try {

                ns.ui.openTail(
                    running[0].pid
                );


                opened++;

            }
            catch {

                // Ignore UI failure.
            }


            continue;
        }


        const pid =
            ns.run(
                monitor.script,
                1
            );


        if (
            pid === 0
        ) {

            failed++;

            continue;
        }


        started++;


        await ns.sleep(
            75
        );
    }


    await ns.alert(

        "BB MONITORS\n\n" +

        `Started: ${started}\n` +

        `Already running: ${opened}\n` +

        `Missing: ${missing}\n` +

        `Failed: ${failed}`
    );
}


// =================================================================
// DISPATCHER MENU
// =================================================================

async function dispatcherMenu(
    ns,
    network
) {

    while (true) {

        const running =
            findProcessesByScript(
                ns,
                network,
                "bb-dispatcher.js"
            );


        const isRunning =
            running.length > 0;


        const options = [];


        if (isRunning) {

            options.push(
                "👁 Open Dispatcher"
            );

            options.push(
                "🔄 Restart Dispatcher"
            );

            options.push(
                "🛑 Stop Dispatcher"
            );
        }
        else {

            options.push(
                "▶ Start Dispatcher"
            );

            options.push(
                "🧪 Start Dispatcher - Dry Run"
            );
        }


        options.push(
            "⚙ Start With Custom Settings"
        );


        options.push(
            "← Back"
        );


        const choice =
            await ns.prompt(

                "HWGW DISPATCHER CONTROL\n\n" +

                (
                    isRunning
                        ? `Status: RUNNING (${running.length} process)`
                        : "Status: STOPPED"
                ),

                {
                    type:
                        "select",

                    choices:
                        options
                }
            );


        if (
            !choice ||
            choice === "← Back"
        ) {

            return;
        }


        // ========================================================
        // OPEN
        // ========================================================

        if (
            choice ===
            "👁 Open Dispatcher"
        ) {

            try {

                ns.ui.openTail(
                    running[0].pid
                );

            }
            catch {

                await ns.alert(
                    `Dispatcher PID: ${running[0].pid}`
                );
            }


            continue;
        }


        // ========================================================
        // STOP
        // ========================================================

        if (
            choice ===
            "🛑 Stop Dispatcher"
        ) {

            const stopped =
                stopProcesses(
                    ns,
                    running
                );


            ns.toast(
                `Stopped ${stopped} dispatcher process(es)`,
                "warning",
                3000
            );


            continue;
        }


        // ========================================================
        // RESTART
        // ========================================================

        if (
            choice ===
            "🔄 Restart Dispatcher"
        ) {

            // Preserve first running dispatcher's arguments.

            const args =
                running[0].args ?? [];


            stopProcesses(
                ns,
                running
            );


            await ns.sleep(
                200
            );


            await startDispatcher(
                ns,
                args
            );


            continue;
        }


        // ========================================================
        // DEFAULT START
        // ========================================================

        if (
            choice ===
            "▶ Start Dispatcher"
        ) {

            await startDispatcher(
                ns,
                [
                    "--hack",
                    0.05,

                    "--reserve",
                    8,

                    "--gap",
                    100,

                    "--max-batches",
                    25
                ]
            );


            continue;
        }


        // ========================================================
        // DRY RUN
        // ========================================================

        if (
            choice ===
            "🧪 Start Dispatcher - Dry Run"
        ) {

            await startDispatcher(
                ns,
                [
                    "--hack",
                    0.05,

                    "--reserve",
                    8,

                    "--gap",
                    100,

                    "--max-batches",
                    25,

                    "--dry-run"
                ]
            );


            continue;
        }


        // ========================================================
        // CUSTOM
        // ========================================================

        if (
            choice ===
            "⚙ Start With Custom Settings"
        ) {

            await customDispatcherMenu(
                ns,
                running
            );


            continue;
        }
    }
}


// =================================================================
// CUSTOM DISPATCHER MENU
// =================================================================

async function customDispatcherMenu(
    ns,
    running
) {

    // -------------------------------------------------------------
    // TARGET
    // -------------------------------------------------------------

    const targetInput =
        await ns.prompt(

            "Dispatcher Target\n\n" +

            "Leave blank for automatic target selection.",

            {
                type:
                    "text"
            }
        );


    if (
        targetInput === false
    ) {

        return;
    }


    const target =
        String(
            targetInput ?? ""
        ).trim();


    if (
        target &&
        !ns.serverExists(target)
    ) {

        await ns.alert(
            `Server does not exist:\n\n${target}`
        );


        return;
    }


    // -------------------------------------------------------------
    // HACK FRACTION
    // -------------------------------------------------------------

    const hackInput =
        await ns.prompt(

            "Hack fraction per batch\n\n" +

            "Examples:\n" +

            "0.05 = 5%\n" +

            "0.10 = 10%",

            {
                type:
                    "text"
            }
        );


    if (!hackInput) {
        return;
    }


    const hack =
        Number(
            hackInput
        );


    if (
        !Number.isFinite(hack) ||
        hack <= 0 ||
        hack > 0.50
    ) {

        await ns.alert(
            "Hack fraction must be greater than 0 and no more than 0.50."
        );


        return;
    }


    // -------------------------------------------------------------
    // HOME RAM RESERVE
    // -------------------------------------------------------------

    const reserveInput =
        await ns.prompt(

            "RAM to reserve on home (GB)",

            {
                type:
                    "text"
            }
        );


    if (!reserveInput) {
        return;
    }


    const reserve =
        Number(
            reserveInput
        );


    if (
        !Number.isFinite(reserve) ||
        reserve < 0
    ) {

        await ns.alert(
            "RAM reserve must be zero or greater."
        );


        return;
    }


    // -------------------------------------------------------------
    // GAP
    // -------------------------------------------------------------

    const gapInput =
        await ns.prompt(

            "Landing gap in milliseconds\n\n" +

            "Recommended starting value: 100",

            {
                type:
                    "text"
            }
        );


    if (!gapInput) {
        return;
    }


    const gap =
        Number(
            gapInput
        );


    if (
        !Number.isFinite(gap) ||
        gap < 20
    ) {

        await ns.alert(
            "Gap must be at least 20 ms."
        );


        return;
    }


    // -------------------------------------------------------------
    // MAX BATCHES
    // -------------------------------------------------------------

    const batchInput =
        await ns.prompt(

            "Maximum parallel batches",

            {
                type:
                    "text"
            }
        );


    if (!batchInput) {
        return;
    }


    const maxBatches =
        Number(
            batchInput
        );


    if (
        !Number.isInteger(maxBatches) ||
        maxBatches <= 0
    ) {

        await ns.alert(
            "Maximum batches must be a positive whole number."
        );


        return;
    }


    // -------------------------------------------------------------
    // DRY RUN?
    // -------------------------------------------------------------

    const dryRun =
        await ns.prompt(

            "Run in DRY RUN mode?\n\n" +

            "Dry run performs analysis but does not launch workers.",

            {
                type:
                    "boolean"
            }
        );


    // -------------------------------------------------------------
    // REPLACE EXISTING?
    // -------------------------------------------------------------

    if (
        running.length > 0
    ) {

        const replace =
            await ns.prompt(

                "A dispatcher is already running.\n\n" +

                "Stop it and start this configuration?",

                {
                    type:
                        "boolean"
                }
            );


        if (!replace) {
            return;
        }


        stopProcesses(
            ns,
            running
        );


        await ns.sleep(
            200
        );
    }


    // -------------------------------------------------------------
    // BUILD ARGS
    // -------------------------------------------------------------

    const args = [

        "--hack",
        hack,

        "--reserve",
        reserve,

        "--gap",
        gap,

        "--max-batches",
        maxBatches
    ];


    if (target) {

        args.push(
            "--target",
            target
        );
    }


    if (dryRun) {

        args.push(
            "--dry-run"
        );
    }


    await startDispatcher(
        ns,
        args
    );
}


// =================================================================
// START DISPATCHER
// =================================================================

async function startDispatcher(
    ns,
    args
) {

    const script =
        "bb-dispatcher.js";


    if (
        !ns.fileExists(
            script,
            "home"
        )
    ) {

        await ns.alert(
            `Missing:\n\n${script}`
        );


        return false;
    }


    // -------------------------------------------------------------
    // CHECK WORKERS
    // -------------------------------------------------------------

    const requiredWorkers = [

        "bb-hack-worker.js",
        "bb-grow-worker.js",
        "bb-weaken-worker.js"
    ];


    const missingWorkers =
        requiredWorkers.filter(
            file =>
                !ns.fileExists(
                    file,
                    "home"
                )
        );


    if (
        missingWorkers.length > 0
    ) {

        await ns.alert(

            "DISPATCHER CANNOT START\n\n" +

            "Missing worker files:\n\n" +

            missingWorkers.join(
                "\n"
            )
        );


        return false;
    }


    // -------------------------------------------------------------
    // START
    // -------------------------------------------------------------

    const pid =
        ns.run(
            script,
            1,
            ...args
        );


    if (
        pid === 0
    ) {

        await showRamFailure(
            ns,
            script
        );


        return false;
    }


    ns.toast(
        `Dispatcher started — PID ${pid}`,
        "success",
        3500
    );


    await ns.sleep(
        100
    );


    try {

        ns.ui.openTail(
            pid
        );

    }
    catch {

        // Dispatcher opens its own window.
    }


    return true;
}


// =================================================================
// SUITE STATUS
// =================================================================

async function showSuiteStatus(
    ns,
    CONFIG,
    network
) {

    const lines = [];


    let totalProcesses = 0;

    let totalThreads = 0;

    let totalRam = 0;


    lines.push(
        "BITBURNER SUITE STATUS"
    );


    lines.push(
        "═".repeat(70)
    );


    for (
        const script
        of CONFIG.suiteScripts
    ) {

        if (
            script ===
            "bb-control.js"
        ) {

            continue;
        }


        const available =
            ns.fileExists(
                script,
                "home"
            );


        const processes =
            findProcessesByScript(
                ns,
                network,
                script
            );


        if (!available) {

            lines.push(
                `${script.padEnd(30)} MISSING`
            );


            continue;
        }


        if (
            processes.length === 0
        ) {

            lines.push(
                `${script.padEnd(30)} STOPPED`
            );


            continue;
        }


        const threads =
            processes.reduce(
                (sum, p) =>
                    sum +
                    p.threads,
                0
            );


        let ram = 0;


        for (
            const process
            of processes
        ) {

            const ramPerThread =
                ns.getScriptRam(
                    process.filename,
                    process.host
                );


            ram +=
                ramPerThread *
                process.threads;
        }


        totalProcesses +=
            processes.length;


        totalThreads +=
            threads;


        totalRam +=
            ram;


        lines.push(

            `${script.padEnd(30)}` +

            `RUNNING  ` +

            `P:${processes.length}` +

            `  T:${threads}` +

            `  RAM:${ns.format.ram(ram)}`
        );
    }


    lines.push("");


    lines.push(
        "─".repeat(70)
    );


    lines.push(
        `Processes: ${totalProcesses}`
    );


    lines.push(
        `Threads: ${totalThreads}`
    );


    lines.push(
        `RAM: ${ns.format.ram(totalRam)}`
    );


    await ns.alert(
        lines.join("\n")
    );
}


// =================================================================
// SHOW ALL PROCESSES
// =================================================================

async function showAllProcesses(
    ns,
    network
) {

    const lines = [];


    let totalProcesses = 0;

    let totalThreads = 0;


    for (
        const server
        of network
    ) {

        const processes =
            ns.ps(server);


        if (
            processes.length === 0
        ) {

            continue;
        }


        lines.push("");


        lines.push(
            `════ ${server} ════`
        );


        for (
            const process
            of processes
        ) {

            totalProcesses++;

            totalThreads +=
                process.threads;


            const args =
                process.args.length > 0
                    ? ` | ${process.args.join(" ")}`
                    : "";


            lines.push(

                `${process.filename}` +

                ` | T:${process.threads}` +

                ` | PID:${process.pid}` +

                args
            );
        }
    }


    const header =

        "RUNNING SCRIPT SUMMARY\n\n" +

        `Processes: ${totalProcesses}\n` +

        `Threads: ${totalThreads}\n`;


    if (
        lines.length === 0
    ) {

        await ns.alert(
            header +
            "\nNo scripts are running."
        );


        return;
    }


    await ns.alert(

        header +
        lines.join("\n")
    );
}


// =================================================================
// LAUNCH UTILITY
// =================================================================

async function launchUtility(
    ns,
    utility,
    network
) {

    const script =
        findExistingUtilityScript(
            ns,
            utility
        );


    if (!script) {

        await ns.alert(

            `${utility.label}\n\n` +

            "No matching script exists on home.\n\n" +

            utility.scripts.join(
                "\n"
            )
        );


        return;
    }


    const running =
        findProcessesByScript(
            ns,
            network,
            script
        );


    if (
        running.length > 0
    ) {

        try {

            ns.ui.openTail(
                running[0].pid
            );


            ns.toast(
                `Opened ${utility.label}`,
                "info",
                2500
            );


            return;

        }
        catch {

            await ns.alert(

                `${utility.label} is running.\n\n` +

                `PID: ${running[0].pid}`
            );


            return;
        }
    }


    const pid =
        ns.run(
            script,
            1
        );


    if (
        pid === 0
    ) {

        await showRamFailure(
            ns,
            script
        );


        return;
    }


    ns.toast(
        `Started ${utility.label}`,
        "success",
        2500
    );


    await ns.sleep(
        100
    );


    try {

        ns.ui.openTail(
            pid
        );

    }
    catch {

        // Utility may not have a tail.
    }
}


// =================================================================
// STOP BB SUITE
// =================================================================

async function stopSuite(
    ns,
    CONFIG,
    network
) {

    const processes = [];


    for (
        const script
        of CONFIG.suiteScripts
    ) {

        if (
            script ===
            "bb-control.js"
        ) {

            continue;
        }


        processes.push(
            ...findProcessesByScript(
                ns,
                network,
                script
            )
        );
    }


    if (
        processes.length === 0
    ) {

        await ns.alert(
            "No BB suite processes are currently running."
        );


        return;
    }


    const confirmed =
        await ns.prompt(

            `Stop ${processes.length} BB suite process(es)?\n\n` +

            "This includes dispatcher workers currently running.",

            {
                type:
                    "boolean"
            }
        );


    if (!confirmed) {
        return;
    }


    const stopped =
        stopProcesses(
            ns,
            processes
        );


    ns.toast(
        `Stopped ${stopped} BB suite process(es)`,
        "warning",
        3500
    );
}


// =================================================================
// STOP PROCESS LIST
// =================================================================

function stopProcesses(
    ns,
    processes
) {

    let stopped = 0;


    const seen =
        new Set();


    for (
        const process
        of processes
    ) {

        if (
            seen.has(
                process.pid
            )
        ) {

            continue;
        }


        seen.add(
            process.pid
        );


        if (
            ns.kill(
                process.pid
            )
        ) {

            stopped++;
        }
    }


    return stopped;
}


// =================================================================
// FIND UTILITY SCRIPT
// =================================================================

function findExistingUtilityScript(
    ns,
    utility
) {

    for (
        const script
        of utility.scripts
    ) {

        if (
            ns.fileExists(
                script,
                "home"
            )
        ) {

            return script;
        }
    }


    return null;
}


// =================================================================
// FIND RUNNING SCRIPT ACROSS NETWORK
// =================================================================

function findProcessesByScript(
    ns,
    network,
    filename
) {

    const results = [];


    for (
        const host
        of network
    ) {

        const processes =
            ns.ps(host);


        for (
            const process
            of processes
        ) {

            if (
                process.filename !==
                filename
            ) {

                continue;
            }


            results.push({

                ...process,

                host
            });
        }
    }


    return results;
}


// =================================================================
// RAM ERROR
// =================================================================

async function showRamFailure(
    ns,
    script
) {

    const scriptRam =
        ns.getScriptRam(
            script,
            "home"
        );


    const maxRam =
        ns.getServerMaxRam(
            "home"
        );


    const usedRam =
        ns.getServerUsedRam(
            "home"
        );


    const freeRam =
        Math.max(
            0,
            maxRam -
            usedRam
        );


    await ns.alert(

        `Could not start ${script}\n\n` +

        `Script RAM: ${ns.format.ram(scriptRam)}\n` +

        `Home Free RAM: ${ns.format.ram(freeRam)}\n\n` +

        "Close another script or increase home RAM."
    );
}


// =================================================================
// NETWORK SCANNER
// =================================================================

function scanNetwork(ns) {

    const visited =
        new Set();


    const servers = [];


    function scan(server) {

        if (
            visited.has(server)
        ) {

            return;
        }


        visited.add(
            server
        );


        servers.push(
            server
        );


        for (
            const neighbor
            of ns.scan(server)
        ) {

            scan(
                neighbor
            );
        }
    }


    scan(
        "home"
    );


    return servers;
}