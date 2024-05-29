// Wait for the DOM to fully load before attaching event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('class-button').addEventListener('click', getClass);
    document.getElementById('hosts-button').addEventListener('click', calculateForHosts);
    document.getElementById('subnets-button').addEventListener('click', calculateForSubnets);
});

// Function to validate IP address format
function validateIP(ip) {
    // Regular expression to match valid IP addresses
    const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return regex.test(ip);
}

// Function to determine and display the class of the given IP address
function getClass() {
    const ip = document.getElementById('ip-address').value;
    if (!validateIP(ip)) {
        document.getElementById('class-result').textContent = "Invalid IP address.";
        return;
    }
    const firstOctet = parseInt(ip.split('.')[0], 10);
    let ipClass = '';
    if (firstOctet >= 1 && firstOctet <= 126) {
        ipClass = 'A';
    } else if (firstOctet >= 128 && firstOctet <= 191) {
        ipClass = 'B';
    } else if (firstOctet >= 192 && firstOctet <= 223) {
        ipClass = 'C';
    } else {
        ipClass = 'Invalid IP address range for class determination.';
    }
    document.getElementById('class-result').textContent = `Class: ${ipClass}`;
}

// Function to calculate subnets based on the number of hosts
function calculateForHosts() {
    const ip = document.getElementById('ip-address').value;
    if (!validateIP(ip)) {
        alert("Invalid IP address.");
        return;
    }
    const numHosts = parseInt(document.getElementById('num-hosts').value, 10);
    if (isNaN(numHosts) || numHosts <= 0) {
        alert("Please enter a valid number of hosts.");
        return;
    }
    const results = calculateSubnetsForHosts(ip, numHosts);
    displayResults(results);
}

// Function to calculate subnets based on the number of subnets
function calculateForSubnets() {
    const ip = document.getElementById('ip-address').value;
    if (!validateIP(ip)) {
        alert("Invalid IP address.");
        return;
    }
    const numSubnets = parseInt(document.getElementById('num-subnets').value, 10);
    if (isNaN(numSubnets) || numSubnets <= 0) {
        alert("Please enter a valid number of subnets.");
        return;
    }
    const results = calculateSubnetsForSubnets(ip, numSubnets);
    displayResults(results);
}

// Helper function to calculate subnets based on the number of hosts
function calculateSubnetsForHosts(ip, numHosts) {
    const borrowedBits = Math.ceil(Math.log2(numHosts + 2)); // Number of bits to borrow to accommodate the hosts
    const subnetMask = 32 - borrowedBits; // Calculate the new subnet mask
    const numSubnets = Math.pow(2, borrowedBits); // Calculate the number of subnets
    const subnets = generateSubnets(ip, numSubnets, subnetMask); // Generate subnets
    return { borrowedBits, numSubnets, subnetMask, subnets };
}

// Helper function to calculate subnets based on the number of subnets
function calculateSubnetsForSubnets(ip, numSubnets) {
    const borrowedBits = Math.ceil(Math.log2(numSubnets)); // Number of bits to borrow to create the subnets
    const subnetMask = 32 - borrowedBits; // Calculate the new subnet mask
    const subnets = generateSubnets(ip, numSubnets, subnetMask); // Generate subnets
    return { borrowedBits, numSubnets, subnetMask, subnets };
}

// Function to generate subnets based on IP, number of subnets, and subnet mask
function generateSubnets(ip, numSubnets, subnetMask) {
    const ipBinary = ipToBinary(ip); // Convert IP address to binary
    const subnets = [];
    const hostBits = 32 - subnetMask; // Number of host bits
    const increment = Math.pow(2, hostBits); // Calculate the increment for each subnet

    for (let i = 0; i < numSubnets; i++) {
        const networkAddressBinary = incrementBinary(ipBinary, increment * i); // Calculate network address
        const networkAddress = binaryToIp(networkAddressBinary);

        const firstHostBinary = incrementBinary(networkAddressBinary, 1); // Calculate first usable host address
        const firstHost = binaryToIp(firstHostBinary);

        const lastHostBinary = incrementBinary(networkAddressBinary, increment - 2); // Calculate last usable host address
        const lastHost = binaryToIp(lastHostBinary);

        const broadcastAddressBinary = incrementBinary(networkAddressBinary, increment - 1); // Calculate broadcast address
        const broadcastAddress = binaryToIp(broadcastAddressBinary);

        subnets.push({
            networkAddress,
            useableRange: `${firstHost} - ${lastHost}`,
            broadcastAddress
        });
    }

    return subnets;
}

// Function to convert IP address from decimal to binary format
function ipToBinary(ip) {
    return ip.split('.').map(octet => parseInt(octet, 10).toString(2).padStart(8, '0')).join('');
}

// Function to convert IP address from binary to decimal format
function binaryToIp(binary) {
    return binary.match(/.{1,8}/g).map(bin => parseInt(bin, 2)).join('.');
}

// Function to increment a binary IP address by a given value
function incrementBinary(binary, increment) {
    const binaryNum = parseInt(binary, 2) + increment;
    return binaryNum.toString(2).padStart(32, '0');
}

// Function to display the results in a dynamic table
function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <h2>Results</h2>
        <p>No. of Borrowed Bits: ${data.borrowedBits}</p>
        <p>No. of Subnets: ${data.numSubnets}</p>
        <p>Subnet Mask: /${data.subnetMask}</p>
        <h3>All Subnets</h3>
        <table>
            <thead>
                <tr>
                    <th>Subnet #</th>
                    <th>Network Address</th>
                    <th>Range of Useable Host Addresses</th>
                    <th>Broadcast Address</th>
                </tr>
            </thead>
            <tbody>
                ${data.subnets.map((subnet, index) => `
                    <tr>
                        <td>${index}</td>
                        <td>${subnet.networkAddress}</td>
                        <td>${subnet.useableRange}</td>
                        <td>${subnet.broadcastAddress}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}
