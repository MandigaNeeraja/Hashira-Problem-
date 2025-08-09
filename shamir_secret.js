const fs = require('fs');

function decodeValue(base, value) {
    const baseNum = parseInt(base);
    let result = 0n;
    const valueStr = value.toString();
    
    for (let i = 0; i < valueStr.length; i++) {
        const digit = valueStr[i];
        let digitValue;
        
        if (digit >= '0' && digit <= '9') {
            digitValue = parseInt(digit);
        } else {
            // Handle hexadecimal digits a-f
            digitValue = digit.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0) + 10;
        }
        
        result = result * BigInt(baseNum) + BigInt(digitValue);
    }
    
    return result;
}

// Extended Euclidean Algorithm for modular inverse
function modInverse(a, m) {
    if (m === 1n) return 0n;
    
    let m0 = m;
    let x0 = 0n;
    let x1 = 1n;
    
    while (a > 1n) {
        let q = a / m;
        let t = m;
        
        m = a % m;
        a = t;
        t = x0;
        
        x0 = x1 - q * x0;
        x1 = t;
    }
    
    if (x1 < 0n) x1 += m0;
    
    return x1;
}

function lagrangeInterpolationC(points, k) {
    // Use a large prime for modular arithmetic
    const PRIME = 2n ** 256n - 189n; // Large prime for modular arithmetic
    
    let result = 0n;
    
    for (let i = 0; i < k; i++) {
        const xi = BigInt(points[i][0]);
        const yi = points[i][1];
        
        let numerator = 1n;
        let denominator = 1n;
        
        // Calculate Lagrange basis polynomial at x=0
        for (let j = 0; j < k; j++) {
            if (i !== j) {
                const xj = BigInt(points[j][0]);
                numerator = (numerator * (-xj % PRIME + PRIME)) % PRIME;
                denominator = (denominator * ((xi - xj) % PRIME + PRIME)) % PRIME;
            }
        }
        
        // Calculate modular inverse of denominator
        const invDenom = modInverse(denominator, PRIME);
        
        // Add this term to the result
        const term = (yi * numerator % PRIME * invDenom % PRIME) % PRIME;
        result = (result + term) % PRIME;
    }
    
    // Convert back to regular integer if it's reasonable
    if (result > PRIME / 2n) {
        result = result - PRIME;
    }
    
    return result < 0n ? -result : result;
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
        //console.log("Starting...");
        // Read and process test case 1
        const jsonString1 = fs.readFileSync('testcase1.json', 'utf8');
        //console.log("Processing test case 1...");
        const c1 = findConstantTerm(jsonString1);

        // Read and process test case 2
        const jsonString2 = fs.readFileSync('testcase2.json', 'utf8');
        //console.log("Processing test case 2...");
        const c2 = findConstantTerm(jsonString2);

        // Print c for both test cases
        //console.log("Results:");
        console.log(c1.toString());
        console.log(c2.toString());
    } catch (error) {
        console.error("Error in main:", error.message);
        console.error("Stack:", error.stack);
    }
}

// Run the program
main();
