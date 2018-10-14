Code explanation:

R.reduce(
    (acc, x) => R.compose(
        R.flip(R.prepend)(acc), 
        R.sum,
        R.map(R.add(1))
    )([x,...acc]), 
    [0]
)([13, 28])


1. The code works with arrays, and as far as I understood, the R.reduce process the array [13, 28] and provide a new one where the initial iteration value is [0]. 
See:  https://ramdajs.com/docs/#reduce

2. So, in this code, the core function, which orchestrates the chain of functions is R.compose, which executes each one from right to left (different from shell scripts). 
See: https://ramdajs.com/docs/#compose

3. As far as I'm concerned, R.add(1) creates a new function that takes one argument and adds 1. 
See: https://ramdajs.com/docs/#add

4. R.map is responsible to execute the add function for each item of the list.
See: https://ramdajs.com/docs/#map

5. R.sum receives the result of  R.map(R.add(1)) and all array items and return the sum (only one number).
See: https://ramdajs.com/docs/#sum

6. R.prepend is responsible to insert a new item ( the result of sum function) in the beginnig of received list and as the function is waiting for a number and a list in this exactly order We use the R.flip() function in order to invert the order of arguments expected by the function avoiding this way the function to receive wrong parameters. 
See: 
https://ramdajs.com/docs/#prepend
https://ramdajs.com/docs/#flip