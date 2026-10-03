/** @param {NS} ns */
export async function main(ns) {

    // ============================================================
    // DASHBOARD SETUP
    // ============================================================

    ns.disableLog("ALL");

    ns.ui.openTail();
    ns.ui.resizeTail(1050, 480);

    let lastDisplay = "";

    const portPrograms = [
        "BruteSSH.exe",
        "FTPCrack.exe",
        "relaySMTP.exe",
        "HTTPWorm.exe",
        "SQLInject.exe"
    ];

    while (true) {

        // ========================================================
        // PLAYER INFORMATION
        // ========================================================

        const playerHackLevel = ns.getHackingLevel();

        const playerMoney =
            ns.getServerMoneyAvailable("home");

        const portsAvailable =
            portPrograms.filter(program =>
                ns.fileExists(program, "home")
            ).length;


        // ========================================================
        // TAIL WINDOW TITLE
        // ========================================================

        ns.ui.setTailTitle(
            `TARGET ACQUISITION  |  ` +
            `Hack ${playerHackLevel}  |  ` +
            `Cash ${formatMoney(ns, playerMoney)}  |  ` +
            `Ports ${portsAvailable}/5`
        );


        // ========================================================
        // NETWORK SCAN
        // ========================================================

        const visited = new Set();
        const servers = [];

        function scanServer(server) {

            if (visited.has(server)) {
                return;
            }

            visited.add(server);
            servers.push(server);

            for (const neighbor of ns.scan(server)) {
                scanServer(neighbor);
            }
        }

        scanServer("home");


        // ========================================================
        // BUILD SERVER DATA
        // ========================================================

        const serverData = [];

        for (const server of servers) {

            if (server === "home") {
                continue;
            }

            // Only display servers we DO NOT own yet
            if (ns.hasRootAccess(server)) {
                continue;
            }

            const hackLevel =
                ns.getServerRequiredHackingLevel(server);

            const portsNeeded =
                ns.getServerNumPortsRequired(server);

            const maxMoney =
                ns.getServerMaxMoney(server);

            const canHack =
                playerHackLevel >= hackLevel;

            const canNuke =
                portsAvailable >= portsNeeded;


            // ----------------------------------------------------
            // Determine target status
            // ----------------------------------------------------

            let status = "READY";

            if (!canHack && !canNuke) {
                status = "HACK + PORTS";
            }
            else if (!canHack) {
                status = "HACK LEVEL";
            }
            else if (!canNuke) {
                status = "PORTS";
            }


            serverData.push({
                server,
                hackLevel,
                portsNeeded,
                maxMoney,
                canHack,
                canNuke,
                status
            });
        }


        // ========================================================
        // SORT TARGETS
        //
        // 1. Lowest required hacking level
        // 2. Lowest required ports
        // 3. Highest money
        // ========================================================

        serverData.sort((a, b) => {

            if (a.hackLevel !== b.hackLevel) {
                return a.hackLevel - b.hackLevel;
            }

            if (a.portsNeeded !== b.portsNeeded) {
                return a.portsNeeded - b.portsNeeded;
            }

            return b.maxMoney - a.maxMoney;
        });


        // ========================================================
        // TOP 10 TARGETS
        // ========================================================

        const topServers =
            serverData.slice(0, 10);


        // ========================================================
        // BUILD DASHBOARD
        // ========================================================

        const lines = [];

        const width = 92;

        lines.push("");

        lines.push(
            " BITBURNER // TARGET ACQUISITION"
        );

        lines.push(
            "─".repeat(width)
        );

        lines.push(
            ` Hack Level: ${playerHackLevel}`.padEnd(25) +
            `Cash: ${formatMoney(ns, playerMoney)}`.padEnd(30) +
            `Port Crackers: ${portsAvailable}/5`
        );

        lines.push(
            "─".repeat(width)
        );

        lines.push("");

        lines.push(
            " # ".padEnd(5) +
            "SERVER".padEnd(25) +
            "HACK".padStart(8) +
            "PORTS".padStart(8) +
            "MAX MONEY".padStart(18) +
            "STATUS".padStart(18)
        );

        lines.push(
            "─── " +
            "─────────────────────── " +
            "─────── " +
            "─────── " +
            "───────────────── " +
            "─────────────────"
        );


        // ========================================================
        // SERVER ROWS
        // ========================================================

        let index = 1;

        for (const data of topServers) {

            lines.push(
                index.toString()
                    .padStart(2) +
                "   " +

                data.server
                    .padEnd(25) +

                data.hackLevel
                    .toString()
                    .padStart(8) +

                data.portsNeeded
                    .toString()
                    .padStart(8) +

                formatMoney(ns, data.maxMoney)
                    .padStart(18) +

                data.status
                    .padStart(18)
            );

            index++;
        }


        // ========================================================
        // FOOTER
        // ========================================================

        lines.push("");

        lines.push(
            "─".repeat(width)
        );

        const readyCount =
            serverData.filter(server =>
                server.canHack &&
                server.canNuke
            ).length;

        lines.push(
            ` Showing ${topServers.length} of ${serverData.length} unrooted servers` +
            `  |  Ready now: ${readyCount}`
        );

        lines.push(
            "─".repeat(width)
        );


        // ========================================================
        // BUILD FINAL DISPLAY STRING
        // ========================================================

        const display =
            lines.join("\n");


        // ========================================================
        // REDRAW ONLY WHEN DATA CHANGES
        //
        // This prevents the tail window from flashing every second.
        // ========================================================

        if (display !== lastDisplay) {

            ns.clearLog();

            for (const line of lines) {
                ns.print(line);
            }

            lastDisplay = display;
        }


        // ========================================================
        // REFRESH CHECK
        // ========================================================

        await ns.sleep(1000);
    }
}


/**
 * Format money consistently for dashboard display.
 *
 * Examples:
 * $950.00k
 * $12.50m
 * $1.75b
 *
 * @param {NS} ns
 * @param {number} value
 */
function formatMoney(ns, value) {

    return "$" +
        ns.format.number(
            value,
            2
        );
}