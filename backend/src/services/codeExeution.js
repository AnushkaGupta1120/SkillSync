const axios = require('axios');

class CodeExecutionService {
  constructor() {
    this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5001';
    this.maxExecutionTime = 30000; // 30 seconds
  }

  async executeCode(code, language, testCases, questionId) {
    try {
      // In production, use containerized code execution (Docker)
      // For now, we'll simulate execution results
      
      const result = await this.simulateExecution(code, language, testCases);
      
      return {
        status: result.status,
        runtime: result.runtime,
        memory: result.memory,
        testCasesPassed: result.testCasesPassed,
        totalTestCases: testCases.length,
        output: result.output,
        error: result.error || null,
        executionId: this.generateExecutionId()
      };

    } catch (error) {
      console.error('Code execution error:', error);
      
      return {
        status: 'Runtime Error',
        runtime: 0,
        memory: 0,
        testCasesPassed: 0,
        totalTestCases: testCases.length,
        output: [],
        error: 'Execution failed: ' + error.message,
        executionId: this.generateExecutionId()
      };
    }
  }

  async simulateExecution(code, language, testCases) {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Basic code analysis for simulation
    const codeLength = code.length;
    const hasLoops = /for|while|forEach/.test(code);
    const hasRecursion = /function.*\1\(|\w+\s*\(.*\1\s*\(/.test(code);
    
    // Simulate results based on code characteristics
    let passRate = 0.7; // Base pass rate
    
    // Adjust based on code quality indicators
    if (code.includes('edge case') || code.includes('boundary')) passRate += 0.2;
    if (hasLoops && hasRecursion) passRate -= 0.1;
    if (codeLength < 50) passRate -= 0.3; // Too short, likely incomplete
    if (codeLength > 1000) passRate -= 0.1; // Too long, might be inefficient
    
    // Add randomness
    passRate += (Math.random() - 0.5) * 0.3;
    passRate = Math.max(0, Math.min(1, passRate));

    const testCasesPassed = Math.floor(testCases.length * passRate);
    const allPassed = testCasesPassed === testCases.length;

    // Determine status
    let status;
    if (allPassed) {
      status = 'Accepted';
    } else if (testCasesPassed > 0) {
      status = 'Wrong Answer';
    } else if (Math.random() < 0.1) {
      status = 'Time Limit Exceeded';
    } else if (Math.random() < 0.05) {
      status = 'Runtime Error';
    } else {
      status = 'Wrong Answer';
    }

    // Generate runtime and memory based on code characteristics
    let baseRuntime = 50 + Math.random() * 100;
    if (hasLoops) baseRuntime *= 1.5;
    if (hasRecursion) baseRuntime *= 1.3;
    
    let baseMemory = 500 + Math.random() * 500;
    if (code.includes('array') || code.includes('list')) baseMemory *= 1.2;
    if (hasRecursion) baseMemory *= 1.4;

    // Generate test case outputs
    const output = testCases.map((testCase, index) => {
      const passed = index < testCasesPassed;
      return {
        input: testCase.input,
        expected: testCase.expected,
        actual: passed ? testCase.expected : 'Wrong output',
        passed,
        runtime: Math.floor(baseRuntime + Math.random() * 20),
        memory: Math.floor(baseMemory + Math.random() * 100)
      };
    });

    return {
      status,
      runtime: Math.floor(baseRuntime),
      memory: Math.floor(baseMemory),
      testCasesPassed,
      output
    };
  }

  async validateCode(code, language) {
    try {
      // Basic syntax validation
      const validationResult = this.performBasicValidation(code, language);
      
      return {
        isValid: validationResult.isValid,
        errors: validationResult.errors,
        warnings: validationResult.warnings
      };

    } catch (error) {
      return {
        isValid: false,
        errors: ['Code validation failed'],
        warnings: []
      };
    }
  }

  performBasicValidation(code, language) {
    const errors = [];
    const warnings = [];

    // Basic validation rules
    if (code.trim().length === 0) {
      errors.push('Code cannot be empty');
      return { isValid: false, errors, warnings };
    }

    if (code.length > 10000) {
      warnings.push('Code is very long, consider optimizing');
    }

    // Language-specific validation
    switch (language.toLowerCase()) {
      case 'javascript':
        return this.validateJavaScript(code, errors, warnings);
      case 'python':
        return this.validatePython(code, errors, warnings);
      case 'java':
        return this.validateJava(code, errors, warnings);
      case 'cpp':
      case 'c++':
        return this.validateCpp(code, errors, warnings);
      default:
        warnings.push('Limited validation available for this language');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  validateJavaScript(code, errors, warnings) {
    // Basic JavaScript validation
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      errors.push('Mismatched braces');
    }

    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    
    if (openParens !== closeParens) {
      errors.push('Mismatched parentheses');
    }

    // Check for common issues
    if (code.includes('console.log') && code.split('console.log').length > 10) {
      warnings.push('Consider reducing console.log statements');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  validatePython(code, errors, warnings) {
    // Basic Python validation
    const lines = code.split('\n');
    let indentationLevel = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().length === 0) continue;
      
      const currentIndent = line.length - line.trimLeft().length;
      
      if (line.trimRight().endsWith(':')) {
        indentationLevel = currentIndent + 4;
      } else if (currentIndent < indentationLevel && line.trim().length > 0) {
        indentationLevel = currentIndent;
      }
    }

    // Check for common Python issues
    if (code.includes('print') && code.split('print').length > 10) {
      warnings.push('Consider reducing print statements');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  validateJava(code, errors, warnings) {
    // Basic Java validation
    if (!code.includes('class ') && !code.includes('interface ')) {
      errors.push('Java code must contain at least one class or interface');
    }

    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      errors.push('Mismatched braces');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  validateCpp(code, errors, warnings) {
    // Basic C++ validation
    if (!code.includes('#include')) {
      warnings.push('Consider including necessary headers');
    }

    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      errors.push('Mismatched braces');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  generateExecutionId() {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getExecutionMetrics(executionId) {
    // In production, retrieve metrics from execution logs
    return {
      executionId,
      startTime: new Date(Date.now() - 5000).toISOString(),
      endTime: new Date().toISOString(),
      peakMemoryUsage: Math.floor(Math.random() * 1000) + 500,
      cpuTime: Math.floor(Math.random() * 100) + 50,
      systemCalls: Math.floor(Math.random() * 50) + 10
    };
  }
}

module.exports = new CodeExecutionService();
