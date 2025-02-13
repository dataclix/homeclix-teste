export function formatCEP(value: string) {
    const val = value.replace(/\D/g, '');
    if (val.length <= 5) {
        return val;
    } else {
        return `${val.substring(0, 5)}-${val.substring(5, 8)}`;
    }
}
export function formatTelefone(value: string) {
    const val = value.replace(/\D/g, ''); // Remove caracteres não numéricos
    if (val.length <= 2) {
        return val; // Retorna somente os primeiros dígitos sem formatação
    } else if (val.length <= 6) {
        return `(${val.substring(0, 2)}) ${val.substring(2)}`; // Formatação inicial (XX) XXXX
    } else {
        return `(${val.substring(0, 2)}) ${val.substring(2, 6)}-${val.substring(6, 10)}`; // Formato completo (XX) XXXX-XXXX
    }
}
export function formatCelular(value: string) {
    const val = value.replace(/\D/g, ''); // Remove caracteres não numéricos
    if (val.length <= 2) {
        return val; // Retorna somente os primeiros dígitos sem formatação
    } else if (val.length <= 7) {
        return `(${val.substring(0, 2)}) ${val.substring(2)}`; // Formatação inicial (XX) XXXX
    } else {
        return `(${val.substring(0, 2)}) ${val.substring(2, 7)}-${val.substring(7, 11)}`; // Formato completo (XX) XXXXX-XXXX
    }
}
export function formatCPFCNPJ(value: string): string {
    const cleanedValue = value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos

    // Verifica se é CPF (11 dígitos) ou CNPJ (14 dígitos)
    if (cleanedValue.length <= 11) {
        // Formatação para CPF (XXX.XXX.XXX-XX)
        return cleanedValue.replace(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})/, function(_, p1, p2, p3, p4) {
            let result = '';
            if (p1) result += p1;
            if (p2) result += '.' + p2;
            if (p3) result += '.' + p3;
            if (p4) result += '-' + p4;
            return result;
        });
    } else {
        // Formatação para CNPJ (XX.XXX.XXX/XXXX-XX)
        return cleanedValue.replace(/^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/, function(_, p1, p2, p3, p4, p5) {
            let result = '';
            if (p1) result += p1;
            if (p2) result += '.' + p2;
            if (p3) result += '.' + p3;
            if (p4) result += '/' + p4;
            if (p5) result += '-' + p5;
            return result;
        });
    }
}

export function formatCPF(value: string) {
    // Remove todos os caracteres não numéricos
    const val = value.replace(/\D/g, '');

    // Aplica a formatação de acordo com o comprimento do valor
    if (val.length <= 3) {
        return val;
    } else if (val.length <= 6) {
        return `${val.substring(0, 3)}.${val.substring(3)}`;
    } else if (val.length <= 9) {
        return `${val.substring(0, 3)}.${val.substring(3, 6)}.${val.substring(6)}`;
    } else {
        return `${val.substring(0, 3)}.${val.substring(3, 6)}.${val.substring(6, 9)}-${val.substring(9, 11)}`;
    }
}
export function formatCNPJ(value: string) {
    // Remove todos os caracteres não numéricos
    const val = value.replace(/\D/g, '');

    // Aplica a formatação de acordo com o comprimento do valor
    if (val.length <= 2) {
        return val;
    } else if (val.length <= 5) {
        return `${val.substring(0, 2)}.${val.substring(2)}`;
    } else if (val.length <= 8) {
        return `${val.substring(0, 2)}.${val.substring(2, 5)}.${val.substring(5)}`;
    } else if (val.length <= 12) {
        return `${val.substring(0, 2)}.${val.substring(2, 5)}.${val.substring(5, 8)}/${val.substring(8)}`;
    } else {
        return `${val.substring(0, 2)}.${val.substring(2, 5)}.${val.substring(5, 8)}/${val.substring(8, 12)}-${val.substring(12, 14)}`;
    }
}
export function validarCPF(cpf: string): boolean {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/\D/g, '');
    
    // Verifica se o CPF tem 11 dígitos
    if (cpf.length !== 11) {
        return false;
    }
    
    // Verifica se todos os dígitos são iguais (caso inválido)
    if (/^(\d)\1{10}$/.test(cpf)) {
        return false;
    }
    
    // Calcula o primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let primeiroDigito = (soma * 10) % 11;
    if (primeiroDigito === 10 || primeiroDigito === 11) {
        primeiroDigito = 0;
    }
    
    // Calcula o segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    let segundoDigito = (soma * 10) % 11;
    if (segundoDigito === 10 || segundoDigito === 11) {
        segundoDigito = 0;
    }
    
    // Verifica se os dígitos verificadores estão corretos
    return cpf.charAt(9) == String(primeiroDigito) && cpf.charAt(10) == String(segundoDigito);
}