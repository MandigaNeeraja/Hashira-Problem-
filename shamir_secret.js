const fs = require('fs');

function decodeValue(base, value) {
    return BigInt(parseInt(value, parseInt(base)));
}

function lagrangeInterpolationC(points, k) {
    let c = 0n;
    for (let i = 0; i < k; i++) {
        const xi = BigInt(points[i][0]);
        const yi = points[i][1];
        let numerator = 1n;
        let denominator = 1n;
        
        for (let j = 0; j < k; j++) {
            if (i !== j) {
                const xj = BigInt(points[j][0]);
                numerator *= (0n - xj);
                denominator *= (xi - xj);
            }
        }
        
        c += yi * numerator / denominator;
    }
    return c;
}

function findConstantTerm(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        const n = data.keys.n;
        const k = data.keys.k;

        if (n < k) {
            throw new Error("Insufficient roots provided");
        }

        // Decode points
        const points = [];
        for (let i = 1; i <= n; i++) {
            if (data[i]) {
                const x = parseInt(i);
                const base = data[i].base;
                const value = data[i].value;
                const y = decodeValue(base, value);
                points.push([x, y]);
            }
        }

        // Check for distinct x values
        const xValues = points.map(p => p[0]);
        if (new Set(xValues).size !== xValues.length) {
            throw new Error("Points must have distinct x values");
        }

        // Select first k points
        const selectedPoints = points.slice(0, k);

        // Compute c using Lagrange interpolation
        const c = lagrangeInterpolationC(selectedPoints, k);
        return c;
    } catch (error) {
        console.error("Error:", error.message);
        throw error;
    }
}

function main() {
    try {
        // Read and process test case 1
        const jsonString1 = fs.readFileSync('testcase1.json', 'utf8');
        const c1 = findConstantTerm(jsonString1);

        // Read and process test case 2
        const jsonString2 = fs.readFileSync('testcase2.json', 'utf8');
        const c2 = findConstantTerm(jsonString2);

        // Print c for both test cases
        console.log(c1.toString());
        console.log(c2.toString());
    } catch (error) {
        console.error("Error in main:", error.message);
    }
}

// Run the program
main();