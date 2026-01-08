export const DEGREES = [
    "B.Tech",
    "B.E.",
    "B.Sc",
    "B.Com",
    "B.A.",
    "M.Tech",
    "M.E.",
    "M.Sc",
    "MBA",
    "MCA",
    "PhD",
    "Diploma",
    "Associate Degree"
];

export const SPECIALIZATIONS = [
    "Computer Science and Engineering",
    "Information Technology",
    "Electronics and Communication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Data Science",
    "Artificial Intelligence",
    "Machine Learning",
    "Cyber Security",
    "Web Development",
    "Software Engineering",
    "Finance",
    "Marketing",
    "Human Resources",
    "Physics",
    "Chemistry",
    "Mathematics",
    "Economics",
    "English Literature"
];

export const UNIVERSITIES = [
    "Indian Institute of Technology (IIT) Bombay",
    "Indian Institute of Technology (IIT) Delhi",
    "Indian Institute of Technology (IIT) Madras",
    "Indian Institute of Technology (IIT) Kanpur",
    "Indian Institute of Technology (IIT) Kharagpur",
    "Indian Institute of Technology (IIT) Roorkee",
    "Indian Institute of Technology (IIT) Guwahati",
    "National Institute of Technology (NIT) Trichy",
    "National Institute of Technology (NIT) Warangal",
    "National Institute of Technology (NIT) Surathkal",
    "Bits Pilani",
    "Delhi University",
    "Jawaharlal Nehru University (JNU)",
    "Anna University",
    "Vellore Institute of Technology (VIT)",
    "Manipal Academy of Higher Education",
    "Amity University",
    "SRM Institute of Science and Technology",
    "Thapar Institute of Engineering and Technology",
    "Symbiosis International University",
    "Harvard University",
    "Stanford University",
    "Massachusetts Institute of Technology (MIT)",
    "University of California, Berkeley",
    "University of Oxford",
    "University of Cambridge",
    "California Institute of Technology (Caltech)",
    "Princeton University",
    "Yale University",
    "Columbia University"
];

export const DEGREE_SPECIALIZATION_MAP: Record<string, string[]> = {
    "B.Tech": [
        "Computer Science and Engineering",
        "Information Technology",
        "Electronics and Communication",
        "Mechanical Engineering",
        "Civil Engineering",
        "Electrical Engineering",
        "Chemical Engineering",
        "Aerospace Engineering",
        "Biotechnology"
    ],
    "B.E.": [
        "Computer Science and Engineering",
        "Information Technology",
        "Electronics and Communication",
        "Mechanical Engineering",
        "Civil Engineering",
        "Electrical Engineering"
    ],
    "B.Sc": [
        "Computer Science",
        "Physics",
        "Chemistry",
        "Mathematics",
        "Zoology",
        "Botany",
        "Information Technology",
        "Agriculture"
    ],
    "B.Com": [
        "General",
        "Accounting and Finance",
        "Banking and Insurance",
        "Computer Applications",
        "Taxation"
    ],
    "B.A.": [
        "English",
        "Economics",
        "History",
        "Political Science",
        "Psychology",
        "Sociology"
    ],
    "M.Tech": [
        "Computer Science and Engineering",
        "Data Science",
        "Artificial Intelligence",
        "VLSI Design",
        "Thermal Engineering",
        "Structural Engineering"
    ],
    "MBA": [
        "Marketing",
        "Finance",
        "Human Resources",
        "Operations Management",
        "Information Technology",
        "Business Analytics"
    ],
    "MCA": [
        "Computer Applications",
        "Software Development",
        "Cloud Computing"
    ]
};
