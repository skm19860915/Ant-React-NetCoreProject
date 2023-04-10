import moment from 'moment'

export const fakeMediaContent = [
    {
        id: 1,
        retailer: "Basha's",
        region: "PHOENIX",
        storeNumber: "1",
        displayType: "Basha's Digital Backlit Unit",
        storeName: "Bashas",
        street: "10111 E. Bell Rd",
        city: "Scottsdale",
        state: "AZ",
        zipcode: "85260",
        ledColor: "#ff0000",
        players: [
            {
                screenshot: "",
                mediaTitle: "69984_Bashas_Spring_Savings_Video_0407_0420_v1.mp4",
                mediaFile: "",
                side: 1,
                status: 0
            }
        ]
    },
    {
        id: 2,
        retailer: "HEB",
        region: "AUSTIN",
        storeNumber: "710",
        displayType: "HEB NEXT-GEN Endcap w/ Inline",
        storeName: "HEB#00710",
        street: "8801 South Congress Avenue",
        city: "Austin",
        state: "TX",
        zipcode: "78745",
        ledColor: "#0000ff",
        players: [
            {
                screenshot: "",
                mediaTitle: "68463_HEB_Video_v3.mp4",
                mediaFile: "",
                side: 1,
                status: 0
            },
            {
                screenshot: "",
                mediaTitle: "68463_HEB_Video_v3.mp4",
                mediaFile: "",
                side: 2,
                status: 1
            },
        ]
    },
    {
        id: 3,
        retailer: "KVAT",
        region: "ABINGDON",
        storeNumber: "1",
        displayType: "KVAT LED Display",
        storeName: "Food City",
        street: "151 Cook Street",
        city: "Abingdon",
        state: "VA",
        zipcode: "24210",
        ledColor: "#00ff00",
        players: [
            {
                screenshot: "",
                mediaTitle: "69984_Bashas_Spring_Savings_Video_0407_0420_v1.mp4",
                mediaFile: "",
                side: 2,
                status: 0
            }
        ]
    },
    {
        id: 4,
        retailer: "KVAT",
        region: "ABINGDON",
        storeNumber: "1",
        displayType: "KVAT LED Display",
        storeName: "Food City",
        street: "151 Cook Street",
        city: "Abingdon",
        state: "VA",
        zipcode: "24210",
        ledColor: "#00ff00",
        players: [
            {
                screenshot: "",
                mediaTitle: "69984_Bashas_Spring_Savings_Video_0407_0420_v1.mp4",
                mediaFile: "",
                side: 2,
                status: 0
            }
        ]
    },
    // {
    //     retailer: "KVAT",
    //     region: "ABINGDON",
    //     storeNumber: "1",
    //     displayType: "KVAT LED Display",
    //     storeName: "Food City",
    //     street: "151 Cook Street",
    //     city: "Abingdon",
    //     state: "VA",
    //     zipcode: "24210",
    //     ledColor: "#00ff00",
    //     players: [
    //         {
    //             screenshot: "",
    //             mediaTitle: "69984_Bashas_Spring_Savings_Video_0407_0420_v1.mp4",
    //             mediaFile: "",
    //             side: 2
    //         }
    //     ]
    // },
    // {
    //     retailer: "KVAT",
    //     region: "ABINGDON",
    //     storeNumber: "1",
    //     displayType: "KVAT LED Display",
    //     storeName: "Food City",
    //     street: "151 Cook Street",
    //     city: "Abingdon",
    //     state: "VA",
    //     zipcode: "24210",
    //     ledColor: "#00ff00",
    //     players: [
    //         {
    //             screenshot: "",
    //             mediaTitle: "69984_Bashas_Spring_Savings_Video_0407_0420_v1.mp4",
    //             mediaFile: "",
    //             side: 2
    //         }
    //     ]
    // },
    // {
    //     retailer: "KVAT",
    //     region: "ABINGDON",
    //     storeNumber: "1",
    //     displayType: "KVAT LED Display",
    //     storeName: "Food City",
    //     street: "151 Cook Street",
    //     city: "Abingdon",
    //     state: "VA",
    //     zipcode: "24210",
    //     ledColor: "#00ff00",
    //     players: [
    //         {
    //             screenshot: "",
    //             mediaTitle: "69984_Bashas_Spring_Savings_Video_0407_0420_v1.mp4",
    //             mediaFile: "",
    //             side: 2
    //         }
    //     ]
    // },
    // {
    //     retailer: "KVAT",
    //     region: "ABINGDON",
    //     storeNumber: "1",
    //     displayType: "KVAT LED Display",
    //     storeName: "Food City",
    //     street: "151 Cook Street",
    //     city: "Abingdon",
    //     state: "VA",
    //     zipcode: "24210",
    //     ledColor: "#00ff00",
    //     players: [
    //         {
    //             screenshot: "",
    //             mediaTitle: "69984_Bashas_Spring_Savings_Video_0407_0420_v1.mp4",
    //             mediaFile: "",
    //             side: 2
    //         }
    //     ]
    // },
    // {
    //     retailer: "KVAT",
    //     region: "ABINGDON",
    //     storeNumber: "1",
    //     displayType: "KVAT LED Display",
    //     storeName: "Food City",
    //     street: "151 Cook Street",
    //     city: "Abingdon",
    //     state: "VA",
    //     zipcode: "24210",
    //     ledColor: "#00ff00",
    //     players: [
    //         {
    //             screenshot: "",
    //             mediaTitle: "69984_Bashas_Spring_Savings_Video_0407_0420_v1.mp4",
    //             mediaFile: "",
    //             side: 2
    //         }
    //     ]
    // },
    // {
    //     retailer: "KVAT",
    //     region: "ABINGDON",
    //     storeNumber: "1",
    //     displayType: "KVAT LED Display",
    //     storeName: "Food City",
    //     street: "151 Cook Street",
    //     city: "Abingdon",
    //     state: "VA",
    //     zipcode: "24210",
    //     ledColor: "#00ff00",
    //     players: [
    //         {
    //             screenshot: "",
    //             mediaTitle: "69984_Bashas_Spring_Savings_Video_0407_0420_v1.mp4",
    //             mediaFile: "",
    //             side: 2
    //         }
    //     ]
    // },
    // {
    //     retailer: "KVAT",
    //     region: "ABINGDON",
    //     storeNumber: "1",
    //     displayType: "KVAT LED Display",
    //     storeName: "Food City",
    //     street: "151 Cook Street",
    //     city: "Abingdon",
    //     state: "VA",
    //     zipcode: "24210",
    //     ledColor: "#00ff00",
    //     players: [
    //         {
    //             screenshot: "",
    //             mediaTitle: "69984_Bashas_Spring_Savings_Video_0407_0420_v1.mp4",
    //             mediaFile: "",
    //             side: 2
    //         }
    //     ]
    // },
    // {
    //     retailer: "KVAT",
    //     region: "ABINGDON",
    //     storeNumber: "1",
    //     displayType: "KVAT LED Display",
    //     storeName: "Food City",
    //     street: "151 Cook Street",
    //     city: "Abingdon",
    //     state: "VA",
    //     zipcode: "24210",
    //     ledColor: "#00ff00",
    //     players: [
    //         {
    //             screenshot: "",
    //             mediaTitle: "69984_Bashas_Spring_Savings_Video_0407_0420_v1.mp4",
    //             mediaFile: "",
    //             side: 2
    //         }
    //     ]
    // },
    // {
    //     retailer: "KVAT",
    //     region: "ABINGDON",
    //     storeNumber: "1",
    //     displayType: "KVAT LED Display",
    //     storeName: "Food City",
    //     street: "151 Cook Street",
    //     city: "Abingdon",
    //     state: "VA",
    //     zipcode: "24210",
    //     ledColor: "#00ff00",
    //     players: [
    //         {
    //             screenshot: "",
    //             mediaTitle: "69984_Bashas_Spring_Savings_Video_0407_0420_v1.mp4",
    //             mediaFile: "",
    //             side: 2
    //         }
    //     ]
    // },
    // {
    //     retailer: "KVAT",
    //     region: "ABINGDON",
    //     storeNumber: "1",
    //     displayType: "KVAT LED Display",
    //     storeName: "Food City",
    //     street: "151 Cook Street",
    //     city: "Abingdon",
    //     state: "VA",
    //     zipcode: "24210",
    //     ledColor: "#00ff00",
    //     players: [
    //         {
    //             screenshot: "",
    //             mediaTitle: "69984_Bashas_Spring_Savings_Video_0407_0420_v1.mp4",
    //             mediaFile: "",
    //             side: 2
    //         }
    //     ]
    // },
    // {
    //     retailer: "KVAT",
    //     region: "ABINGDON",
    //     storeNumber: "1",
    //     displayType: "KVAT LED Display",
    //     storeName: "Food City",
    //     street: "151 Cook Street",
    //     city: "Abingdon",
    //     state: "VA",
    //     zipcode: "24210",
    //     ledColor: "#00ff00",
    //     players: [
    //         {
    //             screenshot: "",
    //             mediaTitle: "69984_Bashas_Spring_Savings_Video_0407_0420_v1.mp4",
    //             mediaFile: "",
    //             side: 2
    //         }
    //     ]
    // },
    // {
    //     retailer: "KVAT",
    //     region: "ABINGDON",
    //     storeNumber: "1",
    //     displayType: "KVAT LED Display",
    //     storeName: "Food City",
    //     street: "151 Cook Street",
    //     city: "Abingdon",
    //     state: "VA",
    //     zipcode: "24210",
    //     ledColor: "#00ff00",
    //     players: [
    //         {
    //             screenshot: "",
    //             mediaTitle: "69984_Bashas_Spring_Savings_Video_0407_0420_v1.mp4",
    //             mediaFile: "",
    //             side: 2
    //         }
    //     ]
    // },
    // {
    //     retailer: "KVAT",
    //     region: "ABINGDON",
    //     storeNumber: "1",
    //     displayType: "KVAT LED Display",
    //     storeName: "Food City",
    //     street: "151 Cook Street",
    //     city: "Abingdon",
    //     state: "VA",
    //     zipcode: "24210",
    //     ledColor: "#00ff00",
    //     players: [
    //         {
    //             screenshot: "",
    //             mediaTitle: "69984_Bashas_Spring_Savings_Video_0407_0420_v1.mp4",
    //             mediaFile: "",
    //             side: 2
    //         }
    //     ]
    // },
    // {
    //     retailer: "KVAT",
    //     region: "ABINGDON",
    //     storeNumber: "1",
    //     displayType: "KVAT LED Display",
    //     storeName: "Food City",
    //     street: "151 Cook Street",
    //     city: "Abingdon",
    //     state: "VA",
    //     zipcode: "24210",
    //     ledColor: "#00ff00",
    //     players: [
    //         {
    //             screenshot: "",
    //             mediaTitle: "69984_Bashas_Spring_Savings_Video_0407_0420_v1.mp4",
    //             mediaFile: "",
    //             side: 2
    //         }
    //     ]
    // },
    // {
    //     retailer: "KVAT",
    //     region: "ABINGDON",
    //     storeNumber: "1",
    //     displayType: "KVAT LED Display",
    //     storeName: "Food City",
    //     street: "151 Cook Street",
    //     city: "Abingdon",
    //     state: "VA",
    //     zipcode: "24210",
    //     ledColor: "#00ff00",
    //     players: [
    //         {
    //             screenshot: "",
    //             mediaTitle: "69984_Bashas_Spring_Savings_Video_0407_0420_v1.mp4",
    //             mediaFile: "",
    //             side: 2
    //         }
    //     ]
    // },
    // {
    //     retailer: "KVAT",
    //     region: "ABINGDON",
    //     storeNumber: "1",
    //     displayType: "KVAT LED Display",
    //     storeName: "Food City",
    //     street: "151 Cook Street",
    //     city: "Abingdon",
    //     state: "VA",
    //     zipcode: "24210",
    //     ledColor: "#00ff00",
    //     players: [
    //         {
    //             screenshot: "",
    //             mediaTitle: "69984_Bashas_Spring_Savings_Video_0407_0420_v1.mp4",
    //             mediaFile: "",
    //             side: 2
    //         }
    //     ]
    // },
    // {
    //     retailer: "KVAT",
    //     region: "ABINGDON",
    //     storeNumber: "1",
    //     displayType: "KVAT LED Display",
    //     storeName: "Food City",
    //     street: "151 Cook Street",
    //     city: "Abingdon",
    //     state: "VA",
    //     zipcode: "24210",
    //     ledColor: "#00ff00",
    //     players: [
    //         {
    //             screenshot: "",
    //             mediaTitle: "69984_Bashas_Spring_Savings_Video_0407_0420_v1.mp4",
    //             mediaFile: "",
    //             side: 2
    //         }
    //     ]
    // },
    // {
    //     retailer: "KVAT",
    //     region: "ABINGDON",
    //     storeNumber: "1",
    //     displayType: "KVAT LED Display",
    //     storeName: "Food City",
    //     street: "151 Cook Street",
    //     city: "Abingdon",
    //     state: "VA",
    //     zipcode: "24210",
    //     ledColor: "#00ff00",
    //     players: [
    //         {
    //             screenshot: "",
    //             mediaTitle: "69984_Bashas_Spring_Savings_Video_0407_0420_v1.mp4",
    //             mediaFile: "",
    //             side: 2
    //         }
    //     ]
    // },
    // {
    //     retailer: "KVAT",
    //     region: "ABINGDON",
    //     storeNumber: "1",
    //     displayType: "KVAT LED Display",
    //     storeName: "Food City",
    //     street: "151 Cook Street",
    //     city: "Abingdon",
    //     state: "VA",
    //     zipcode: "24210",
    //     ledColor: "#00ff00",
    //     players: [
    //         {
    //             screenshot: "",
    //             mediaTitle: "69984_Bashas_Spring_Savings_Video_0407_0420_v1.mp4",
    //             mediaFile: "",
    //             side: 2
    //         }
    //     ]
    // },
    // {
    //     retailer: "KVAT",
    //     region: "ABINGDON",
    //     storeNumber: "1",
    //     displayType: "KVAT LED Display",
    //     storeName: "Food City",
    //     street: "151 Cook Street",
    //     city: "Abingdon",
    //     state: "VA",
    //     zipcode: "24210",
    //     ledColor: "#00ff00",
    //     players: [
    //         {
    //             screenshot: "",
    //             mediaTitle: "69984_Bashas_Spring_Savings_Video_0407_0420_v1.mp4",
    //             mediaFile: "",
    //             side: 2
    //         }
    //     ]
    // },
    // {
    //     retailer: "KVAT",
    //     region: "ABINGDON",
    //     storeNumber: "1",
    //     displayType: "KVAT LED Display",
    //     storeName: "Food City",
    //     street: "151 Cook Street",
    //     city: "Abingdon",
    //     state: "VA",
    //     zipcode: "24210",
    //     ledColor: "#00ff00",
    //     players: [
    //         {
    //             screenshot: "",
    //             mediaTitle: "69984_Bashas_Spring_Savings_Video_0407_0420_v1.mp4",
    //             mediaFile: "",
    //             side: 2
    //         }
    //     ]
    // },
    // {
    //     retailer: "KVAT",
    //     region: "ABINGDON",
    //     storeNumber: "1",
    //     displayType: "KVAT LED Display",
    //     storeName: "Food City",
    //     street: "151 Cook Street",
    //     city: "Abingdon",
    //     state: "VA",
    //     zipcode: "24210",
    //     ledColor: "#00ff00",
    //     players: [
    //         {
    //             screenshot: "",
    //             mediaTitle: "69984_Bashas_Spring_Savings_Video_0407_0420_v1.mp4",
    //             mediaFile: "",
    //             side: 2
    //         }
    //     ]
    // },
    // {
    //     retailer: "KVAT",
    //     region: "ABINGDON",
    //     storeNumber: "1",
    //     displayType: "KVAT LED Display",
    //     storeName: "Food City",
    //     street: "151 Cook Street",
    //     city: "Abingdon",
    //     state: "VA",
    //     zipcode: "24210",
    //     ledColor: "#00ff00",
    //     players: [
    //         {
    //             screenshot: "",
    //             mediaTitle: "69984_Bashas_Spring_Savings_Video_0407_0420_v1.mp4",
    //             mediaFile: "",
    //             side: 2
    //         }
    //     ]
    // },
]


export const fakeScheduleList = [
    {
        id: 1,
        retailer: "Bashas",
        region: "PEOHNIX",
        scheduleName: "Holiday November",
        startDate: moment(new Date()),
        video: {
            filename: "Holiday_November.mp4",
            filepath: "Holiday_November.mp4"
        },
        displayType: "KVAT LED Display",
        ledColor: "rgb(0, 0, 0)",
    },
    {
        id: 2,
        retailer: "Bashas",
        region: "PEOHNIX",
        scheduleName: "Holiday November",
        startDate: moment(new Date()),
        video: {
            filename: "Holiday_November.mp4",
            filepath: "Holiday_November.mp4"
        },
        displayType: "KVAT LED Display",
        ledColor: "rgb(0, 0, 0)",
    },
    {
        id: 3,
        retailer: "Bashas",
        region: "PEOHNIX",
        scheduleName: "Holiday November",
        startDate: moment(new Date()),
        video: {
            filename: "Holiday_November.mp4",
            filepath: "Holiday_November.mp4"
        },
        displayType: "KVAT LED Display",
        ledColor: "rgb(0, 0, 0)",
    },
    {
        id: 4,
        retailer: "Bashas",
        region: "PEOHNIX",
        scheduleName: "Holiday November",
        startDate: moment(new Date()),
        video: {
            filename: "Holiday_November.mp4",
            filepath: "Holiday_November.mp4"
        },
        displayType: "KVAT LED Display",
        ledColor: "rgb(0, 0, 0)",
    },
]

export const fakeDisplayTypes = [
    "KVAT LED Display",
    "HEB Next-Gen Endcap",
    "HEB Next-Gen Endcap w/ Inline",
    "Test",
    "HEB Test Player",
    "LAB LED Display",
    "LAB Next-Gen Endcap",
    "LAB Next-Gen Endcap w/ Inline",
    "LAB Test Player",
    "HEB Digital End Cap",
    "Basha's Digital Backlit Unit",
    "Save mart Digital Backlit Unit",
]

export const fakeRetailers = [
    "Bashas'",
    "HEB",
    "HEB DIGITAL TECHNOLOGY",
    "KVAT",
    "LAB",
    "Save Mart",
]

export const fakeRegions = [
    "BORDER",
    "CENTRAL TX",
    "SAN ANTONIO",
    "HOUSTON",
    "GULF COAST",
    "ABINGDON",
    "TEST REGION",
    "MARYVILLE",
    "CALHOON",
    "SAN ANTONIO",
    "LAB",
    "AUSTIN",
    "PHOENIX",
    "CENTRAL CA",
    "LUBBOCK",
]

export const fakeColors = [
    {id: 1, name: "Yellow", color: {r: 255, g: 255, b: 0}},
    {id: 2, name: "Red", color: {r: 255, g: 0, b: 0}},
    {id: 3, name: "Orange", color: {r: 255, g: 59, b: 16}},
    {id: 4, name: "Blue", color: {r: 0, g: 0, b: 255}},
    {id: 5, name: "Green", color: {r: 0, g: 255, b: 0}},
    {id: 6, name: "Purple", color: {r: 128, g: 0, b: 128}},
    {id: 7, name: "White", color: {r: 255, g: 255, b: 255}},
    {id: 8, name: "Black - Turned Off", color: {r: 0, g: 0, b: 0}},
    {id: 9, name: "Magenta", color: {r: 255, g: 0, b: 100}},
    {id: 10, name: "Pink", color: {r: 255, g: 60, b: 70}},
    {id: 11, name: "White (50% Brightness)", color: {r: 128, g: 128, b: 128}},
]
